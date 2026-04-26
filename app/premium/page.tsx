'use client';

import { useState, useEffect } from 'react';
import { useSession, signIn, signOut } from "next-auth/react";
import { get, set } from 'idb-keyval';
import { ClassroomRepo } from '@/types';
// import { logger } from "@/lib/logger";

// ASSUME your useAssignmentSync hook is imported here exactly as you wrote it.
import { useAssignmentSync } from '@/hooks/useAssignmentSync'; 

const sanitizeRepoInput = (input: string): string => {
    let path = input.trim().replace(/^(https?:\/\/)?(www\.)?github\.com\//i, '').replace(/\.git$/, '').replace(/\/$/, '');
    if (!path.includes('/')) path = `chaicodehq/${path}`;
    return path;
};

export default function Dashboard() {
    const { data: session, status } = useSession();
    const [repos, setRepos] = useState<ClassroomRepo[]>([]);
    const [loadingRepos, setLoadingRepos] = useState<boolean>(false);
    const [manualInput, setManualInput] = useState<string>('');
    const [errorMsg, setErrorMsg] = useState<string | null>(null);
    const [globalSyncPulse, setGlobalSyncPulse] = useState<number>(0);

    // ... Keep all your existing useEffects and functions (loadReposFromDB, fetchReposFromServer, handleManualSubmit, etc.)
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

    // --- RENDER STATES ---
    if (status === "loading") return <div className="min-h-screen bg-brand-dark flex items-center justify-center text-status-blue">Initializing Engine...</div>;

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
        <div className="flex h-screen bg-brand-dark text-text-primary font-sans overflow-hidden">
            {/* Sidebar upgraded to Premium UI */}
            <aside className="w-72 bg-brand-panel border-r border-ui-border flex flex-col z-20 flex-shrink-0">
                <div className="p-6 border-b border-ui-border flex items-center gap-3">
                    <img src={session.user?.image || ''} alt="Profile" className="w-10 h-10 rounded-full border border-ui-border-light" />
                    <div className="overflow-hidden">
                        <h2 className="text-sm font-bold text-white truncate">{session.user?.name}</h2>
                        <p className="text-[11px] text-text-muted font-mono mt-0.5">Session Active</p>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto p-4 custom-scrollbar flex flex-col gap-6 mt-2">
                    <div>
                        <div className="flex justify-between items-center mb-4 px-2">
                            <h3 className="label-micro">Tracked Repos ({repos.length})</h3>
                            <button onClick={() => fetchReposFromServer(true)} disabled={loadingRepos} className="text-xs text-status-blue hover:text-white transition-colors">
                                {loadingRepos ? 'Scanning...' : '🔄 Rescan'}
                            </button>
                        </div>
                        <div className="space-y-1">
                            {repos.map(repo => (
                                <div key={repo.id} className="text-[13px] text-text-muted p-2 rounded-md truncate flex justify-between items-center group hover:bg-white/5 hover:text-white transition-colors cursor-default">
                                    <span className="truncate pr-2 font-medium">{repo.name.replace(/-[a-zA-Z0-9]+$/, '')}</span>
                                    {repo.isManual && <span className="text-[9px] bg-ui-border px-1.5 py-0.5 rounded text-text-dim font-bold">MANUAL</span>}
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="bg-ui-card border border-ui-border-light rounded-lg p-4">
                        <h3 className="label-micro mb-3">Track Manual Repo</h3>
                        <form onSubmit={handleManualSubmit} className="flex flex-col gap-2">
                            <input className="bg-brand-dark border border-ui-border px-3 py-2 text-sm rounded-md focus:border-brand-orange outline-none text-white w-full transition-colors" placeholder="user/repo-name..." value={manualInput} onChange={(e) => setManualInput(e.target.value)} />
                            <button type="submit" className="bg-white/5 border border-ui-border hover:bg-white/10 px-4 py-2 rounded-md text-[13px] text-white font-medium w-full transition-colors">Add to Board</button>
                        </form>
                    </div>
                </div>

                <div className="p-4 border-t border-ui-border">
                    <button
                        onClick={async () => {
                            await set('cac_repos', []);
                            sessionStorage.clear();
                            signOut();
                        }}
                        className="w-full text-xs font-semibold text-text-muted hover:text-brand-red hover:bg-brand-red/10 py-2.5 rounded-md transition-colors"
                    >
                        Disconnect Session
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 overflow-y-auto relative custom-scrollbar p-8 lg:p-12">
                <div className="max-w-[1600px] mx-auto">
                    <div className="mb-10">
                        <div className="label-micro mb-2">CONTROL ROOM</div>
                        <h1 className="font-display text-[2.5rem] font-extrabold text-white mb-2 tracking-tight">Macro Dashboard</h1>
                        <p className="text-sm text-text-muted">Live autograding telemetry for your GitHub Classroom assignments.</p>
                    </div>

                    {errorMsg && (
                        <div className="mb-6 p-4 rounded-md bg-brand-orange/10 border border-brand-orange/20 text-brand-orange text-sm">
                            ⚠️ {errorMsg}
                        </div>
                    )}

                    {repos.length === 0 && !loadingRepos ? (
                        <div className="flex flex-col items-center justify-center text-text-dim mt-20 p-12 border border-dashed border-ui-border rounded-xl max-w-lg mx-auto bg-ui-card">
                            <span className="text-4xl mb-4">📭</span>
                            <p className="text-lg font-medium text-text-muted">No assignments found.</p>
                            <button onClick={() => fetchReposFromServer(true)} className="mt-6 btn-primary">Scan Organization</button>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 xl:grid-cols-2 2xl:grid-cols-3 gap-6 items-start">
                            {repos.map((repo, idx) => (
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
                </div>
            </main>
        </div>
    );
}

// ============================================================================
// 🧱 COMPONENT: ASSIGNMENT CARD (Wired to SWR Engine)
// ============================================================================
const AssignmentCard = ({ repo, index, onRemove, globalSyncPulse }: { repo: ClassroomRepo; index: number; onRemove: (id: number) => void; globalSyncPulse: number }) => {
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
    let statusText = 'Pending';
    
    if (isLoading) {
        uiState = 'fetching';
        statusText = 'Extracting Logs...';
    } else if (error && !progress) {
        uiState = 'error';
        statusText = 'Network Error';
    } else if (error && progress) {
        uiState = 'error';
        statusText = 'Offline (Stale)';
    } else if (progress) {
        if (progress.totalMax > 0 && progress.totalEarned === progress.totalMax) {
            uiState = 'success';
            statusText = 'Completed';
        } else if (progress.totalEarned > 0) {
            uiState = 'fetching'; // Or map to stale/warning if you prefer
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
            
            {/* Top Info Section */}
            <div className="p-6 pb-4 flex flex-col gap-4 relative">
                {isLoading && (
                    <div className="absolute top-4 right-4 flex items-center gap-2 text-[10px] text-status-blue font-medium bg-status-blue/10 px-2 py-0.5 rounded-full border border-status-blue/30">
                        <span className="w-1.5 h-1.5 rounded-full bg-status-blue animate-pulse"></span>
                        Syncing
                    </div>
                )}

                <div className="flex flex-col gap-1 pr-20">
                    <div className="label-micro truncate">{repo.fullName.split('/')[0]}</div>
                    <h3 className="font-display text-xl font-bold text-white truncate" title={repo.name}>{cleanName}</h3>
                </div>

                <div className="flex justify-between items-end mt-2">
                    <div className="flex flex-col">
                        <div className="label-micro mb-1">{error && progress ? 'LAST SAVED SCORE' : 'SCORE'}</div>
                        <div className={`font-display text-3xl font-bold leading-none ${current.scoreText}`}>
                            {displayScore} <span className="text-base text-text-dim font-sans font-medium">/ {displayMax}</span>
                        </div>
                    </div>
                    
                    <div className="flex flex-col items-end gap-1">
                        <span className="font-mono text-[11px] text-text-muted bg-white/5 px-2 py-0.5 rounded border border-ui-border-light">
                            {progress?.commit ? progress.commit.substring(0, 7) : 'No commit'}
                        </span>
                        {progress?.workflowStatus && (
                            <span className="text-[10px] text-brand-orange animate-pulse">
                                {progress.workflowStatus}
                            </span>
                        )}
                    </div>
                </div>

                {/* Progress Bar */}
                <div className="w-full h-1.5 bg-black/40 rounded-full overflow-hidden mt-2 border border-white/5">
                    <div className={`h-full rounded-full transition-all duration-1000 ${current.bar}`} style={{ width: `${percent}%` }}></div>
                </div>
                {error && !progress && <p className="text-xs text-brand-orange mt-1">{error}</p>}
            </div>

            {/* Action Footer */}
            <div className="bg-black/20 border-t border-ui-border-light px-6 py-3 flex justify-between items-center mt-auto">
                <div className="flex gap-4">
                    <a href={repo.url} target="_blank" rel="noopener noreferrer" className="text-xs text-text-muted hover:text-white transition-colors flex items-center gap-1 font-medium">
                        ↗ Repo
                    </a>
                    {repo.isManual && error && !progress && (
                        <button onClick={() => onRemove(repo.id)} className="text-xs text-brand-orange hover:text-red-400 transition-colors font-medium">
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
                        Sync
                    </button>
                    <button 
                        onClick={() => setExpanded(!expanded)} 
                        disabled={isLoading && !progress} 
                        className="text-[13px] text-status-blue hover:text-white disabled:opacity-50 transition-colors font-medium"
                    >
                        {expanded ? 'Hide ▲' : 'Details ▼'}
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
                        <div className="text-center text-xs text-text-muted py-4">No detailed test logs available.</div>
                    )}
                </div>
            </div>
        </div>
    );
};