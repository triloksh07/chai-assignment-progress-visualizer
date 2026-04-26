'use client';

import Link from 'next/link';
import React, { useState, useEffect } from 'react';
import { useSession, signIn, signOut } from "next-auth/react";
import { get, set } from 'idb-keyval';
import { ClassroomRepo } from '@/types';
import { useAssignmentSync } from '@/hooks/useAssignmentSync'; // Your actual SWR engine

const sanitizeRepoInput = (input: string): string => {
  let path = input.trim().replace(/^(https?:\/\/)?(www\.)?github\.com\//i, '').replace(/\.git$/, '').replace(/\/$/, '');
  if (!path.includes('/')) path = `chaicodehq/${path}`;
  return path;
};

export default function MainDashboardPage() {
  const { data: session, status } = useSession();
  const [repos, setRepos] = useState<ClassroomRepo[]>([]);
  const [loadingRepos, setLoadingRepos] = useState<boolean>(false);
  const [manualInput, setManualInput] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [globalSyncPulse, setGlobalSyncPulse] = useState<number>(0);
  const [isClient, setIsClient] = useState(false);

  // Hydration safety for IndexedDB
  useEffect(() => { setIsClient(true); }, []);

  // Session & Auth logic
  useEffect(() => {
      if (session?.error === "RefreshAccessTokenError") signIn('github');
  }, [session]);

  useEffect(() => {
      if (status === 'authenticated') loadReposFromDB();
  }, [status]);

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

  const handleManualSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      if (!manualInput) return;
      const cleanPath = sanitizeRepoInput(manualInput);
      if (repos.some(r => r.fullName.toLowerCase() === cleanPath.toLowerCase())) {
          setManualInput(''); return;
      }
      const newRepo: ClassroomRepo = {
          id: Date.now(), name: cleanPath.split('/')[1], fullName: cleanPath, url: `https://github.com/${cleanPath}`, updatedAt: new Date().toISOString(), isManual: true
      };
      const updatedRepos = [newRepo, ...repos];
      setRepos(updatedRepos);
      await set('cac_repos', updatedRepos);
      setManualInput('');
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

  // --- Auth Guards ---
  if (status === "loading" || !isClient) {
      return <div className="min-h-screen bg-brand-dark flex items-center justify-center text-status-blue font-mono">Initializing SWR Engine...</div>;
  }

  if (!session) {
      return (
          <div className="min-h-screen bg-brand-dark flex flex-col items-center justify-center text-text-primary p-4">
              <div className="glass-card max-w-md w-full text-center shadow-2xl flex flex-col gap-6 p-10">
                  <div className="flex justify-center text-brand-orange">
                      <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect width="24" height="24" rx="4" fill="#FF5B14" stroke="none"/><path d="M8 17L14 12L8 7" stroke="white" strokeLinecap="round" strokeLinejoin="round"/></svg>
                  </div>
                  <div>
                      <h1 className="text-2xl font-display font-bold mb-2">Telemetry.dev</h1>
                      <p className="text-text-muted text-sm">Authenticate via GitHub App to securely sync your classroom progress logs.</p>
                  </div>
                  <button onClick={() => signIn('github')} className="btn-primary w-full justify-center">
                      Connect GitHub
                  </button>
              </div>
          </div>
      );
  }

  return (
    <div className="relative flex flex-col min-h-screen bg-brand-dark text-text-primary font-sans overflow-x-hidden">
      
      {/* App Header */}
      <header className="app-header">
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <div className="flex">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect width="24" height="24" rx="4" fill="#FF5B14" />
                <path d="M8 17L14 12L8 7" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <div className="flex flex-col">
              <span className="font-display font-bold text-base leading-none tracking-tight">Telemetry.dev</span>
              <span className="text-[0.55rem] text-text-muted font-semibold tracking-widest mt-0.5 uppercase">CLASSROOM POLLING ENGINE</span>
            </div>
          </div>
        </div>

        <nav className="hidden md:flex h-full">
          <Link href="/main-dashboard" className="h-16 px-4 flex items-center text-text-primary text-[13px] font-medium relative after:content-[''] after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-brand-orange">Dashboard</Link>
          <button onClick={() => {
              set('cac_repos', []);
              sessionStorage.clear();
              signOut();
          }} className="h-16 px-4 flex items-center text-text-muted text-[13px] font-medium transition-colors hover:text-brand-red">Disconnect Cache</button>
        </nav>

        <div className="flex-1 flex justify-end items-center gap-4">
          <div className="hidden md:flex items-center gap-2 font-mono text-xs text-text-muted">
            <div className="w-1.5 h-1.5 rounded-full bg-status-green shadow-[0_0_8px_#2ECC71]"></div>
            engine • online
          </div>
          <div className="flex items-center gap-2 px-3 h-8 rounded-md border border-ui-border-light bg-ui-card text-[13px] text-text-primary font-medium">
            <img src={session.user?.image || ''} alt="Profile" className="w-5 h-5 rounded-full" />
            {session.user?.name?.split(' ')[0] || 'Developer'}
          </div>
        </div>
      </header>

      <main className="page-container w-full max-w-[1600px] mx-auto">
        <div className="w-full flex flex-col gap-8">

          {/* Control Room Header */}
          <div className="flex flex-col md:flex-row justify-between md:items-end gap-6 mb-2">
            <div className="flex flex-col gap-2">
              <div className="label-micro">CONTROL ROOM</div>
              <h1 className="font-display text-[2.5rem] font-extrabold leading-[1.1] tracking-tight text-white">
                Tracking <span className="text-gradient">{repos.length} Repositories</span>.
              </h1>
              <div className="font-mono text-[13px] text-text-muted mt-1">
                IndexedDB cache loaded in 0ms · SWR delays active to prevent Thundering Herd
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-4 shrink-0">
              <form onSubmit={handleManualSubmit} className="flex relative">
                <input 
                  type="text" 
                  value={manualInput}
                  onChange={(e) => setManualInput(e.target.value)}
                  placeholder="Add repo manually..." 
                  className="bg-brand-panel border border-ui-border rounded-l-md px-3 py-2 text-sm text-white outline-none focus:border-brand-orange transition-colors w-48"
                />
                <button type="submit" className="bg-white/5 border border-l-0 border-ui-border rounded-r-md px-3 py-2 text-sm text-white hover:bg-white/10 transition-colors">+</button>
              </form>
              <button onClick={() => fetchReposFromServer(true)} disabled={loadingRepos} className="flex items-center justify-center gap-2 px-4 py-2 bg-brand-orange text-white rounded-md font-semibold text-sm shadow-[0_4px_12px_rgba(255,91,20,0.3)] transition-all hover:brightness-110 hover:-translate-y-px cursor-pointer disabled:opacity-50">
                {loadingRepos ? 'Scanning...' : 'Force Global Poll'}
              </button>
            </div>
          </div>

          {errorMsg && (
            <div className="p-4 rounded-md bg-brand-orange/10 border border-brand-orange/20 text-brand-orange text-sm font-mono">
                ⚠️ [API ERROR] {errorMsg}
            </div>
          )}

          {/* SWR Architecture Stat Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="glass-card !transform-none hover:!translate-y-0 flex items-center gap-6 py-6 px-6 cursor-default">
              <div className="w-16 h-16 rounded-full flex items-center justify-center bg-status-blue/10 border border-status-blue/20 shrink-0">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#3498DB" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><ellipse cx="12" cy="5" rx="9" ry="3"></ellipse><path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"></path><path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"></path></svg>
              </div>
              <div className="flex flex-col">
                <div className="label-micro mb-1">LOCAL CACHE</div>
                <div className="font-display text-[1.5rem] font-bold leading-none text-white mb-1">IndexedDB</div>
                <div className="text-[13px] text-text-muted">Instant paint enabled</div>
              </div>
            </div>

            <div className="glass-card !transform-none hover:!translate-y-0 flex items-center gap-6 py-6 px-6 cursor-default">
              <div className="w-16 h-16 rounded-full flex items-center justify-center bg-status-green/10 border border-status-green/20 shrink-0">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#2ECC71" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
              </div>
              <div className="flex flex-col">
                <div className="label-micro mb-1">RATE LIMIT SHIELD</div>
                <div className="font-display text-[1.5rem] font-bold leading-none text-white mb-1">Mutex Locks</div>
                <div className="text-[13px] text-text-muted">Concurrency active</div>
              </div>
            </div>

            <div className="glass-card !transform-none hover:!translate-y-0 flex items-center gap-6 py-6 px-6 cursor-default">
              <div className="w-16 h-16 rounded-full flex items-center justify-center bg-brand-orange/10 border border-brand-orange/20 shrink-0">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#FF5B14" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
              </div>
              <div className="flex flex-col">
                <div className="label-micro mb-1">NETWORK GATEWAY</div>
                <div className="font-display text-[1.5rem] font-bold leading-none text-white mb-1">45m Cooldown</div>
                <div className="text-[13px] text-text-muted">Heavy fetches blocked</div>
              </div>
            </div>
          </div>

          {/* System Telemetry Banner */}
          {/* <div className="live-banner">
            <div className="flex items-center gap-2 text-status-blue font-semibold tracking-widest border-r border-ui-border pr-4 shrink-0">
              <div className="w-2 h-2 bg-status-blue rounded-full shadow-[0_0_8px_#3498DB] animate-pulse"></div>
              SYSTEM
            </div>
            <div className="text-text-muted animate-ticker whitespace-nowrap min-w-full font-mono">
              <span className="text-text-dim">syslog:</span> <span className="text-status-green font-bold">[active]</span> background polling enabled ·&nbsp;&nbsp;&nbsp;
              <span className="text-text-dim">syslog:</span> <span className="text-status-blue font-bold">[mutex]</span> enforcing 800ms cascade delay per component ·&nbsp;&nbsp;&nbsp;
              <span className="text-text-dim">syslog:</span> <span className="text-brand-orange font-bold">[cache]</span> awaiting tab focus to revalidate hashes
            </div>
          </div> */}

          {/* Filters Row */}
          <div className="flex flex-col md:flex-row justify-between md:items-center mt-4 gap-4">
            <div className="flex flex-wrap gap-3">
              <div className="filter-pill filter-pill-active">All <span className="bg-black/10 rounded px-1.5 font-mono text-[11px]">{repos.length}</span></div>
            </div>
            <div className="relative w-full md:w-auto">
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 text-text-dim w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
              <input 
                type="text" 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full md:w-[300px] bg-ui-card border border-ui-border rounded-md py-2 pl-9 pr-4 text-white text-sm outline-none transition-colors focus:border-brand-orange" 
                placeholder="Search repository..." 
              />
            </div>
          </div>

          {/* Assignments Grid (Actual SWR Implementation) */}
          {repos.length === 0 && !loadingRepos ? (
            <div className="flex flex-col items-center justify-center text-text-dim mt-10 p-12 border border-dashed border-ui-border rounded-xl max-w-lg mx-auto bg-ui-card">
                <span className="text-4xl mb-4">📭</span>
                <p className="text-lg font-medium text-text-muted">No assignments tracked yet.</p>
                <button onClick={() => fetchReposFromServer(true)} className="mt-6 btn-primary">Scan Organization</button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredRepos.map((repo, idx) => (
                  <AssignmentCard
                      key={repo.id}
                      repo={repo}
                      index={idx}
                      onRemove={handleRemoveRepo}
                      globalSyncPulse={globalSyncPulse}
                  />
              ))}
            </div>
          )}

          {/* Engine Anatomy Section */}
          {/* <div className="mt-16 pt-16 border-t border-ui-border flex flex-col gap-8">
            <div className="text-left">
              <div className="label-micro mb-2">SWR STATE ANATOMY</div>
              <h2 className="font-display text-[2rem] font-bold tracking-tight text-white mb-2">The four phases of a poll.</h2>
              <p className="text-[14px] text-text-muted max-w-2xl">Each card manages its own concurrency lock and visually communicates what the SWR engine is currently executing in the background.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <AnatomyCard status="stale" title="INSTANT PAINT" desc="Reads from IndexedDB in 0ms. SWR engine is currently sleeping." />
              <AnatomyCard status="fetching" title="EXTRACTING LOGS" desc="Hash mismatch detected. Extracting AWS workflow logs server-side." />
              <AnatomyCard status="success" title="SUCCESSFUL PARSE" desc="Logs parsed server-side. Local IndexedDB cache updated." />
              <AnatomyCard status="error" title="API RATE LIMIT / 404" desc="Network fetch blocked. Showing last known state from cache." />
            </div>
          </div> */}
        </div>
      </main>

      <footer className="w-full max-w-[1600px] mx-auto flex justify-between px-6 py-8 border-t border-ui-border font-mono text-[13px] text-text-dim mt-auto">
        <div>telemetry.dev · polling-engine healthy</div>
      </footer>
    </div>
  );
}

// ============================================================================
// 🧱 COMPONENT: ASSIGNMENT CARD (Wired to SWR Engine)
// ============================================================================
function AssignmentCard({ repo, index, onRemove, globalSyncPulse }: { repo: ClassroomRepo; index: number; onRemove: (id: number) => void; globalSyncPulse: number }) {
  const [expanded, setExpanded] = useState<boolean>(false);
  const { progress, status, error, runLightPoll, runHeavySync } = useAssignmentSync(repo.fullName, index * 800);

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
  } else if (error && progress) {
      uiState = 'error';
      statusText = 'Offline (Stale Cache)';
  } else if (progress) {
      if (progress.totalMax > 0 && progress.totalEarned === progress.totalMax) {
          uiState = 'success';
          statusText = 'Tests Passed';
      } else if (progress.totalEarned > 0) {
          uiState = 'fetching'; 
          statusText = 'In Progress';
      } else {
          uiState = 'stale';
          statusText = 'Cached';
      }
  }

  // --- PREMIUM TAILWIND MAPPING ---
  const stateMap = {
      stale: {
          card: 'border-ui-border-light',
          pill: 'text-text-muted bg-white/5 border-white/10',
          dot: 'bg-text-dim',
          bar: 'bg-text-dim',
          scoreText: 'text-white'
      },
      fetching: {
          card: 'border-status-blue/30 shadow-[0_0_20px_rgba(52,152,219,0.05)]',
          pill: 'text-status-blue bg-status-blue/10 border-status-blue/20',
          dot: 'bg-status-blue animate-pulse',
          bar: 'bg-status-blue',
          scoreText: 'text-text-dim'
      },
      success: {
          card: 'border-status-green/30 shadow-[0_0_20px_rgba(46,204,113,0.05)]',
          pill: 'text-status-green bg-status-green/10 border-status-green/20',
          dot: 'bg-status-green',
          bar: 'bg-status-green',
          scoreText: 'text-white'
      },
      error: {
          card: 'border-brand-orange/40 shadow-[0_0_20px_rgba(255,91,20,0.05)]',
          pill: 'text-brand-orange bg-brand-orange/10 border-brand-orange/20',
          dot: 'bg-brand-orange',
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
                  <h3 className="font-display text-xl font-bold text-white truncate" title={repo.name}>{cleanName}</h3>
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
                      {progress?.workflowStatus && (
                          <span className="text-[10px] text-brand-orange animate-pulse">
                              {progress.workflowStatus}
                          </span>
                      )}
                  </div>
              </div>

              <div className="w-full h-1.5 bg-black/40 rounded-full overflow-hidden mt-2 border border-white/5">
                  <div className={`h-full rounded-full transition-all duration-1000 ${current.bar}`} style={{ width: `${percent}%` }}></div>
              </div>
              {error && !progress && <p className="text-xs text-brand-orange mt-1">{error}</p>}
          </div>

          <div className="bg-black/20 border-t border-ui-border-light px-6 py-3 flex justify-between items-center mt-auto">
              <div className="flex gap-4">
                  <a href={repo.url} target="_blank" rel="noopener noreferrer" className="text-xs text-text-muted hover:text-white transition-colors flex items-center gap-1 font-medium">
                      ↗ Repo
                  </a>
                  {repo.isManual && (
                      <button onClick={() => onRemove(repo.id)} className="text-xs text-text-dim hover:text-brand-red transition-colors font-medium">
                          Remove
                      </button>
                  )}
              </div>

              <div className="flex gap-4 items-center">
                  <span className={`whitespace-nowrap text-[10px] px-2 py-0.5 rounded font-bold border ${current.pill}`}>
                      {statusText}
                  </span>
                  <button 
                      onClick={runHeavySync} 
                      disabled={isLoading} 
                      className="text-xs text-text-muted hover:text-white disabled:opacity-50 transition-colors flex items-center gap-1 font-medium"
                  >
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 12a9 9 0 1 1-9-9c2.52 0 4.93 1 6.74 2.74L21 8"/><path d="M21 3v5h-5"/></svg>
                      Force
                  </button>
                  <button 
                      onClick={() => setExpanded(!expanded)} 
                      disabled={isLoading && !progress} 
                      className="text-[13px] text-status-blue hover:text-white disabled:opacity-50 transition-colors font-medium"
                  >
                      {expanded ? 'Hide ▲' : 'Logs ▼'}
                  </button>
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
}

// ============================================================================
// 🧱 COMPONENT: STATIC ANATOMY CARD (For Documentation Section)
// ============================================================================
// function AnatomyCard({ status, title, desc }: { status: 'stale'|'fetching'|'success'|'error', title: string, desc: string }) {
//   const stateMap = {
//     stale: { card: 'border-ui-border-light', bar: 'bg-text-dim' },
//     fetching: { card: 'border-status-blue/30 shadow-[0_0_20px_rgba(52,152,219,0.05)]', bar: 'bg-status-blue' },
//     success: { card: 'border-status-green/30 shadow-[0_0_20px_rgba(46,204,113,0.05)]', bar: 'bg-status-green' },
//     error: { card: 'border-brand-orange/40 shadow-[0_0_20px_rgba(255,91,20,0.05)]', bar: 'bg-brand-orange' }
//   };
//   const current = stateMap[status];

//   return (
//     <div className={`glass-card flex flex-col p-6 gap-4 transition-all duration-300 ${current.card} !transform-none hover:!translate-y-0 cursor-default`}>
//       <h3 className="font-display text-lg font-bold text-white">{title}</h3>
//       <div className="w-full h-1 bg-white/10 rounded-full overflow-hidden">
//         <div className={`h-full rounded-full ${current.bar}`} style={{ width: status==='fetching'?'40%':'100%' }}></div>
//       </div>
//       <p className="text-[13px] text-text-muted leading-relaxed">{desc}</p>
//     </div>
//   );
// }