'use client';

import Link from 'next/link';
import React, { useState, useEffect, memo } from 'react';
import { useSession, signIn, signOut } from "next-auth/react";
import { get, set } from 'idb-keyval';
import { ClassroomRepo } from '@/types';
import { useAssignmentSync } from '@/hooks/useAssignmentSync';

const sanitizeRepoInput = (input: string): string => {
  let path = input.trim().replace(/^(https?:\/\/)?(www\.)?github\.com\//i, '').replace(/\.git$/, '').replace(/\/$/, '');
  if (!path.includes('/')) path = `chaicodehq/${path}`;
  return path;
};

export default function MainDashboardPage() {
  const { data: session, status } = useSession();
  const [repos, setRepos] = useState<ClassroomRepo[]>([]);
  const [loadingRepos, setLoadingRepos] = useState<boolean>(false);
  // const [manualInput, setManualInput] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [globalSyncPulse, setGlobalSyncPulse] = useState<number>(0);
  const [isClient, setIsClient] = useState(false);

  // const [dashboardStats, setDashboardStats] = useState({ completed: 0, inProgress: 0, pending: 0 });

  // to hold the latest scores from children
  const [progressDictionary, setProgressDictionary] = useState<Record<string, any>>({});

  // Hydration bypass
  useEffect(() => { setIsClient(true); }, []);

  useEffect(() => {
    if (session?.error === "RefreshAccessTokenError") signIn('github');
  }, [session]);

  //eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => {
    if (status === 'authenticated') loadReposFromDB();
  }, [status]);

  const handleProgressUpdate = React.useCallback((repoFullName: string, progress: any) => {
    setProgressDictionary(prev => {
      // Prevent state updates if progress hasn't actually changed
      const prevProg = prev[repoFullName];
      if (!progress || (prevProg && prevProg.totalEarned === progress.totalEarned && prevProg.totalMax === progress.totalMax)) {
        return prev;
      }
      return { ...prev, [repoFullName]: progress };
    });
  }, []);

  let completed = 0, inProgress = 0, pending = 0;

  repos.forEach(repo => {
    const prog = progressDictionary[repo.fullName];
    if (prog && prog.totalMax > 0) {
      if (prog.totalEarned === prog.totalMax) completed++;
      else if (prog.totalEarned > 0) inProgress++;
      else pending++;
    } else {
      pending++; // No progress reported yet
    }
  });

  // Math for the dynamic circular gradients
  const totalRepos = repos.length || 1; // Prevent div by 0
  const pctCompleted = Math.round((completed / totalRepos) * 100) || 0;
  const pctInProgress = Math.round((inProgress / totalRepos) * 100) || 0;
  const pctPending = Math.round((pending / totalRepos) * 100) || 0;

  const loadReposFromDB = async () => {
    const cachedRepos = await get<ClassroomRepo[]>('cac_repos');
    if (cachedRepos && cachedRepos.length > 0) setRepos(cachedRepos);
    else fetchReposFromServer(false);
  };

  const fetchReposFromServer = async (isManualRescan = false) => {
    setLoadingRepos(true);
    setErrorMsg(null);
    try {
      const res = await fetch('/api/repos');
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to scan organization.");

      const existingPaths = new Set(repos.map(r => r.fullName.toLowerCase()));
      const newUniqueRepos = data.repos.filter((r: ClassroomRepo) => !existingPaths.has(r.fullName.toLowerCase()));
      const combined = [...newUniqueRepos, ...repos];

      setRepos(combined);
      await set('cac_repos', combined);
      if (isManualRescan) setGlobalSyncPulse(Date.now());
    } catch (err: any) {
      setErrorMsg(err.message);
    } finally {
      setLoadingRepos(false);
    }
  };

  const handleRemoveRepo = async (idToRemove: number) => {
    const filtered = repos.filter(r => r.id !== idToRemove);
    setRepos(filtered);
    await set('cac_repos', filtered);
  };

  const filteredRepos = repos.filter(repo =>
    repo.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    repo.fullName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (status === "loading" || !isClient) {
    return <div className="min-h-screen bg-brand-dark flex items-center justify-center text-status-blue font-mono">Initializing SWR Engine...</div>;
  }

  return (
    <div className="relative flex flex-col min-h-screen w-full max-w-7xl mx-auto bg-brand-dark text-text-primary font-sans overflow-x-hidden">

      <main className="page-container w-full max-w-400 mx-auto">
        <div className="w-full flex flex-col gap-8">

          {/* Control Room Header */}
          <div className="flex flex-col md:flex-row justify-between md:items-end gap-6 mb-2">
            <div className="flex flex-col gap-2">
              <div className="label-micro">CONTROL ROOM</div>
              <h1 className="font-display text-[1.5rem] md:text-[2.5rem] font-extrabold leading-[1.1] tracking-tight text-white">
                Tracking <span className="text-gradient">{repos.length} Repositories</span>
              </h1>
            </div>
            <div className="flex flex-col sm:flex-row gap-4 shrink-0">
              <button onClick={() => fetchReposFromServer(true)} disabled={loadingRepos} className="flex items-center justify-center gap-2 px-4 py-2 bg-brand-orange text-white rounded-md font-semibold text-sm shadow-[0_4px_12px_rgba(255,91,20,0.3)] transition-all hover:brightness-110 hover:-translate-y-px cursor-pointer disabled:opacity-50">
                {loadingRepos ? 'Scanning GitHub...' : 'Force Global Sync'}
              </button>
            </div>
          </div>

          {errorMsg && (
            <div className="p-4 rounded-md bg-brand-orange/10 border border-brand-orange/20 text-brand-orange text-sm font-mono">
              ⚠️ [API ERROR] {errorMsg}
            </div>
          )}

          {/* Top Stat Cards (Dynamically Aggregated from IndexedDB) */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

            {/* COMPLETED CARD */}
            <div className="glass-card transform-none! hover:translate-y-0! flex items-center gap-6 py-6 px-6 cursor-default">
              <div className="w-20 h-20 rounded-full flex items-center justify-center relative shrink-0" style={{ background: `conic-gradient(#2ECC71 ${pctCompleted}%, rgba(255,255,255,0.05) 0)` }}>
                <div className="absolute inset-2 rounded-full bg-[#111113]"></div>
                <div className="relative z-10 font-display font-bold text-xl text-white">{pctCompleted}%</div>
              </div>
              <div className="flex flex-col">
                <div className="label-micro mb-1">COMPLETED</div>
                <div className="font-display text-[2rem] font-bold leading-none text-white mb-1">{completed} <span className="text-base text-text-dim font-medium font-sans">/ {repos.length}</span></div>
                <div className="text-[13px] text-text-muted">100% tests passing</div>
              </div>
            </div>

            {/* IN-PROGRESS CARD */}
            <div className="glass-card !transform-none hover:!translate-y-0 flex items-center gap-6 py-6 px-6 cursor-default">
              <div className="w-20 h-20 rounded-full flex items-center justify-center relative shrink-0" style={{ background: `conic-gradient(#3498DB ${pctInProgress}%, rgba(255,255,255,0.05) 0)` }}>
                <div className="absolute inset-2 rounded-full bg-[#111113]"></div>
                <div className="relative z-10 font-display font-bold text-xl text-white">{pctInProgress}%</div>
              </div>
              <div className="flex flex-col">
                <div className="label-micro mb-1">IN-PROGRESS</div>
                <div className="font-display text-[2rem] font-bold leading-none text-white mb-1">{inProgress} <span className="text-base text-text-dim font-medium font-sans">/ {repos.length}</span></div>
                <div className="text-[13px] text-text-muted">Partial points earned</div>
              </div>
            </div>

            {/* PENDING / QUEUED CARD */}
            <div className="glass-card !transform-none hover:!translate-y-0 flex items-center gap-6 py-6 px-6 cursor-default">
              <div className="w-20 h-20 rounded-full flex items-center justify-center relative shrink-0" style={{ background: `conic-gradient(#FF5B14 ${pctPending}%, rgba(255,255,255,0.05) 0)` }}>
                <div className="absolute inset-2 rounded-full bg-[#111113]"></div>
                <div className="relative z-10 font-display font-bold text-xl text-white">{pctPending}%</div>
              </div>
              <div className="flex flex-col">
                <div className="label-micro mb-1">PENDING</div>
                <div className="font-display text-[2rem] font-bold leading-none text-white mb-1">{pending} <span className="text-base text-text-dim font-medium font-sans">/ {repos.length}</span></div>
                <div className="text-[13px] text-text-muted">Awaiting fixes</div>
              </div>
            </div>

          </div>

          {/* Filters Row */}
          <div className="flex flex-col md:flex-row justify-between md:items-center mt-4 gap-4">
            <div className="relative w-full md:w-[400px]">
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 text-text-dim w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-ui-card border border-ui-border rounded-md py-2.5 pl-9 pr-4 text-white text-sm outline-none transition-colors focus:border-brand-orange"
                placeholder="Search repository..."
              />
            </div>
          </div>

          {repos.length === 0 && !loadingRepos ? (
            <div className="flex flex-col items-center justify-center text-text-dim mt-10 p-12 border border-dashed border-ui-border rounded-xl max-w-lg mx-auto bg-ui-card">
              <span className="text-4xl mb-4">📭</span>
              <p className="text-lg font-medium text-text-muted">No assignments tracked yet.</p>
              <button onClick={() => fetchReposFromServer(true)} className="mt-6 btn-primary">Scan Organization</button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 items-start pb-16">
              {filteredRepos.map((repo, idx) => (
                <AssignmentCard
                  key={repo.id}
                  repo={repo}
                  index={idx}
                  onRemove={handleRemoveRepo}
                  globalSyncPulse={globalSyncPulse}
                  onProgressUpdate={handleProgressUpdate}
                />
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

// ============================================================================
// 🧱 COMPONENT: ASSIGNMENT CARD
// ============================================================================
const AssignmentCard = memo(function AssignmentCard(
  {
    repo,
    index,
    onRemove,
    globalSyncPulse,
    onProgressUpdate
  }: {
    repo: ClassroomRepo;
    index: number;
    onRemove: (id: number) => void;
    globalSyncPulse: number,
    onProgressUpdate: (repoFullName: string, progress: unknown) => void,
  }) {
  const [expanded, setExpanded] = useState<boolean>(false);
  const { progress, status, error, runLightPoll, runHeavySync } = useAssignmentSync(repo.fullName, index * 1200);

  // Bubble the progress up to the parent instantly whenever it changes
  useEffect(() => {
    onProgressUpdate(repo.fullName, progress);
  }, [progress, repo.fullName, onProgressUpdate]);

  // Global Pulse Listener
  useEffect(() => {
    if (globalSyncPulse > 0) {
      const timer = setTimeout(() => runLightPoll(true), index * 400);
      return () => clearTimeout(timer);
    }
  }, [globalSyncPulse, runLightPoll, index]);

  // --- STATE TRANSLATOR (Hook Data -> Visual States) ---
  const isLoading = status === 'fetching' || status === 'polling';

  let uiState: 'stale' | 'fetching' | 'success' | 'error' = 'stale';
  let statusText = 'Cached (Sleeping)';

  if (isLoading) {
    uiState = 'fetching';
    statusText = 'Extracting AWS Logs...';
  } else if (error && !progress) {
    uiState = 'error';
    statusText = 'Network Error';
  } else if (progress) {
    if (progress.totalMax > 0 && progress.totalEarned === progress.totalMax) {
      uiState = 'success';
      statusText = error ? 'Completed (Cached)' : 'Completed';
    } else if (progress.totalEarned > 0) {
      uiState = 'fetching';
      statusText = error ? 'In Progress (Cached)' : 'In Progress';
    } else {
      uiState = 'stale';
      statusText = error ? 'Pending (Cached)' : 'Pending';
    }
  }

  // --- PREMIUM TAILWIND MAPPING ---
  const stateMap = {
    stale: {
      card: 'border-ui-border-light',
      pill: 'text-text-muted bg-white/5 border-white/10',
      bar: 'bg-text-dim',
      scoreText: 'text-white'
    },
    fetching: {
      card: 'border-status-blue/30 shadow-[0_0_20px_rgba(52,152,219,0.05)]',
      pill: 'text-status-blue bg-status-blue/10 border-status-blue/20',
      bar: 'bg-status-blue',
      scoreText: 'text-white'
    },
    success: {
      card: 'border-status-green/30 shadow-[0_0_20px_rgba(46,204,113,0.05)]',
      pill: 'text-status-green bg-status-green/10 border-status-green/20',
      bar: 'bg-status-green',
      scoreText: 'text-white'
    },
    error: {
      card: 'border-brand-orange/40 shadow-[0_0_20px_rgba(255,91,20,0.05)]',
      pill: 'text-brand-orange bg-brand-orange/10 border-brand-orange/20',
      bar: 'bg-brand-orange',
      scoreText: 'text-text-dim'
    }
  };

  const current = stateMap[uiState];
  const cleanName = repo.name.replace(/-[a-zA-Z0-9]+$/, '');
  const displayScore = progress ? progress.totalEarned : '?';
  const displayMax = progress ? progress.totalMax : '--';
  const percent = progress && progress.totalMax > 0 ? (progress.totalEarned / progress.totalMax) * 100 : 0;

  return (
    <div className={`glass-card flex flex-col p-0 transition-all duration-300 ${current.card}`}>

      {/* Top Section */}
      <div className="p-6 pb-4 flex flex-col gap-4 relative">
        {isLoading && (
          <div className="absolute top-4 right-4 flex items-center gap-2 text-[10px] text-status-blue font-medium bg-status-blue/10 px-2 py-0.5 rounded-full border border-status-blue/30">
            <span className="w-1.5 h-1.5 rounded-full bg-status-blue animate-pulse"></span>
            Mutex Locked
          </div>
        )}

        <div className="flex flex-col gap-1 pr-20">
          <div className="label-micro truncate flex items-center gap-2">
            {repo.fullName.split('/')[0]}
            {repo.isManual && <span className="bg-white/10 px-1 py-0.5 rounded text-[9px]">MANUAL</span>}
          </div>
          {/* Dynamic Link routing directly to the Assignment Inspector */}
          <Link href={`/assignment?repo=${repo.fullName}`} className="font-display text-xl font-bold text-white truncate hover:text-brand-orange transition-colors w-fit" title={repo.name}>
            {cleanName}
          </Link>
        </div>

        <div className="flex justify-between items-end mt-2">
          <div className="flex flex-col">
            <div className="label-micro mb-1">{error && progress ? 'LAST CACHED SCORE' : 'SCORE'}</div>
            <div className={`font-display text-3xl font-bold leading-none ${current.scoreText}`}>
              {displayScore} <span className="text-base text-text-dim font-sans font-medium">/ {displayMax}</span>
            </div>
          </div>

          <div className="flex flex-col items-end gap-1">
            <span className="font-mono text-[11px] text-text-muted bg-white/5 px-2 py-0.5 rounded border border-ui-border-light">
              {progress?.commit ? progress.commit.substring(0, 7) : 'No cache'}
            </span>
          </div>
        </div>

        <div className="w-full h-1.5 bg-black/40 rounded-full overflow-hidden mt-2 border border-white/5">
          <div className={`h-full rounded-full transition-all duration-1000 ${current.bar}`} style={{ width: `${percent}%` }}></div>
        </div>
        {error && !progress && <p className="text-xs text-brand-orange mt-1">{error}</p>}
      </div>

      {/* Action Footer */}
      <div className="bg-black/20 border-t border-ui-border-light px-6 py-3 flex justify-between items-center mt-auto">
        <div className="flex gap-4 items-center">
          {statusText !== "Pending" && <span className={`whitespace-nowrap text-[10px] px-2 py-0.5 rounded font-bold border ${current.pill}`}>
            {statusText}
          </span>}
          {progress?.workflowStatus && (
            <span className="text-[10px] font-semibold text-brand-orange">
              {progress.workflowStatus}
            </span>
          )}
        </div>

        <div className="flex gap-4 items-center">
          <button
            onClick={runHeavySync}
            disabled={isLoading}
            className="text-xs text-text-muted hover:text-white disabled:opacity-50 transition-colors flex items-center gap-1 font-medium"
            title="Force Poll"
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 12a9 9 0 1 1-9-9c2.52 0 4.93 1 6.74 2.74L21 8" /><path d="M21 3v5h-5" />

            </svg>
            Sync
          </button>
          <button
            onClick={() => setExpanded(!expanded)}
            disabled={isLoading && !progress}
            className="text-[13px] text-status-blue hover:text-white disabled:opacity-50 transition-colors font-medium"
          >
            {expanded ? 'Hide ▲' : 'Logs ▼'}
          </button>
          {/* Dedicated Inspector Button */}
          <Link href={`https://github.com/${repo.fullName}`} target="_blank" className="text-[13px] text-text-muted hover:text-white transition-colors ml-2 font-medium">
            Repo ↗
          </Link>
        </div>
      </div>

      {/* Expandable Test Results Section */}
      <div className={`overflow-hidden transition-all duration-300 ease-in-out ${expanded ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}>
        <div className="px-6 pb-6 pt-4 bg-black/40 border-t border-ui-border-light grid grid-cols-1 gap-2 overflow-y-auto custom-scrollbar max-h-64">
          {progress?.results?.map((test, idx) => (
            <div key={idx} className="flex justify-between items-center text-[13px] p-2.5 rounded-md bg-white/5 border border-ui-border-light">
              <span className="text-gray-300 truncate pr-4 font-medium">{test.test}</span>
              <span className={`font-mono text-xs shrink-0 ${test.status === 'passed' ? 'text-status-green' : test.status === 'pending' ? 'text-brand-orange' : 'text-brand-red'}`}>
                {test.earned} / {test.max}
              </span>
            </div>
          ))}
          {(!progress?.results || progress.results.length === 0) && (
            <div className="text-center text-xs text-text-muted py-4">No detailed test logs mapped.</div>
          )}
        </div>
      </div>
    </div>
  );
})