"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { get, set, del } from "idb-keyval";
import { ClassroomRepo, ProgressData } from "@/types";
import { logger } from "@/lib/logger";

// ============================================================================
// ⚙️ THE SWR ENGINE
// ============================================================================
const POLL_COOLDOWN_MS = 45 * 60 * 1000; // 45 Minutes
export function useAssignmentSync(repoFullName: string, cascadeDelayMs: number) {
  const [progress, setProgress] = useState<ProgressData | null>(null);
  const [status, setStatus] = useState<"idle" | "polling" | "fetching">("idle");
  const [error, setError] = useState<string | null>(null);

  const cacheKey = `progress_${repoFullName}`;
  const timeKey = `last_poll_${repoFullName}`;

  const isProcessing = useRef(false);

  const executeHeavyFetch = useCallback(
    async (reason: string, knownCommit?: string) => {
      if (isProcessing.current) return;
      isProcessing.current = true;

      logger.info(
        `⏳ [HEAVY FETCH] ${repoFullName} triggered because: ${reason}`
      );
      setStatus("fetching");

      // Start the 45-minute cooldown clock!
      sessionStorage.setItem(timeKey, Date.now().toString());

      try {
        const res = await fetch("/api/progress", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ repoPath: repoFullName }),
        });

        const data = await res.json();

        if (!res.ok) {
          if (res.status === 401)
            throw new Error("GitHub session expired. Please sign in again.");
          if (res.status === 429) throw new Error("Rate limit exceeded.");
          if (res.status === 404) {
            setProgress(null);
            throw new Error("Repository or autograding data not found.");
          }
          throw new Error(data.error || "Network error.");
        }

        // Defensively inject the commit if the backend dropped it
        if (!data.commit && knownCommit) {
          data.commit = knownCommit;
        }

        setProgress(data);
        await set(cacheKey, data);
        setError(null);
      } catch (err: any) {
        logger.error(`❌ [FETCH ERROR] ${repoFullName}: ${err.message}`);
        setError(err.message);
      } finally {
        setStatus("idle");
        isProcessing.current = false; // Release the lock
      }
    },
    [repoFullName, cacheKey]
  );

  const executeLightPoll = useCallback(
    async (force = false) => {
      if (isProcessing.current) return;

      const cachedData = await get<ProgressData>(cacheKey);

      if (!cachedData) {
        await executeHeavyFetch("Cache is completely empty");
        return;
      }

      // we need to change the storage from session to local or other
      const lastPolled = parseInt(sessionStorage.getItem(timeKey) || "0", 10);
      const timeElapsed = Date.now() - lastPolled;

      if (!force && timeElapsed < POLL_COOLDOWN_MS && cachedData) {
        logger.debug(`🛡️ [COOLDOWN] ${repoFullName} poll blocked.`);
        return;
      }

      isProcessing.current = true;

      setStatus("polling");
      sessionStorage.setItem(timeKey, Date.now().toString());

      try {
        const pollRes = await fetch("/api/poll", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ repoPath: repoFullName }),
        });

        if (!pollRes.ok) {
          if (pollRes.status === 401)
            throw new Error("GitHub session expired. Please sign in again.");
          throw new Error(`Poll ping failed: ${pollRes.status}`);
        }

        const { commit } = await pollRes.json();
        const remoteCommit = commit || null; // Normalize empty repos to null

        if (cachedData.commit !== remoteCommit) {
          // Lock must be released before calling another locked function
          isProcessing.current = false;
          await executeHeavyFetch(
            `Hash Mismatch (Cache: ${cachedData.commit} vs Remote: ${remoteCommit})`,
            remoteCommit
          );
        } else {
          logger.info(
            `💤 [SWR SLEEP] ${repoFullName} - Hashes match (${remoteCommit}).`
          );
          setStatus("idle");
          setError(null);
        }
      } catch (err: any) {
        logger.warn(
          { err: err.message },
          `Background poll failed for ${repoFullName}`
        );
        setError(err.message);
        setStatus("idle");
      } finally {
        isProcessing.current = false; // Release the lock
      }
    },
    [repoFullName, timeKey, cacheKey, executeHeavyFetch]
  );

  // STABLE MANUAL SYNC OVERRIDE
  const runHeavySync = useCallback(() => {
    executeHeavyFetch("Manual UI Sync", progress?.commit || undefined);
  }, [executeHeavyFetch, progress?.commit]);

  useEffect(() => {
    let isMounted = true;
    let syncTimer: NodeJS.Timeout;

    // Centralized Debounced Trigger
    const triggerSync = async (forcePoll = false) => {
      clearTimeout(syncTimer);

      // Read cache immediately to route traffic properly
      const cached = await get<ProgressData>(cacheKey);

      syncTimer = setTimeout(async () => {
        if (!isMounted) return;

        if (!cached) {
          await executeHeavyFetch("Initial Boot / Empty Cache");
        } else {
          await executeLightPoll(forcePoll);
        }
      }, cascadeDelayMs);
    };

    // initial mount sequence
    get<ProgressData>(cacheKey).then((cached) => {
      if (isMounted && cached) setProgress(cached);
      triggerSync(false);
    });

    // Window Events
    const handleFocus = () => triggerSync(false);

    const handleVisibility = () => {
      if (document.visibilityState === "visible") handleFocus();
    };

    window.addEventListener("focus", handleFocus);
    document.addEventListener("visibilitychange", handleVisibility);

    return () => {
      isMounted = false;
      clearTimeout(syncTimer);
      window.removeEventListener("focus", handleFocus);
      document.removeEventListener("visibilitychange", handleVisibility);
    };
  }, [cacheKey, cascadeDelayMs, executeLightPoll, executeHeavyFetch]);

  return {
    progress,
    status,
    error,
    runLightPoll: executeLightPoll, // Perfectly Stable
    runHeavySync: runHeavySync, // Perfectly Stable
  };
}

