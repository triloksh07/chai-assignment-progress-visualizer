'use client';

import { useState, useEffect } from 'react';
import { useSession, signIn, signOut } from "next-auth/react";
import { get, set } from 'idb-keyval';
import { ClassroomRepo, ProgressData } from '@/types';

// --- Utility: Input Sanitizer ---
const sanitizeRepoInput = (input: string): string => {
    let path = input.trim();
    path = path.replace(/^(https?:\/\/)?(www\.)?github\.com\//i, '');
    path = path.replace(/\.git$/, '').replace(/\/$/, '');

    if (!path.includes('/')) {
        const orgName = process.env.NEXT_PUBLIC_GITHUB_ORG || 'organization';
        path = `${orgName}/${path}`;
    }
    return path;
};

// --- Utility: Formats date ---
const timeAgo = (dateString: string): string => {
    if (!dateString) return 'Just now';
    const seconds = Math.floor((new Date().getTime() - new Date(dateString).getTime()) / 1000);
    let interval = seconds / 31536000;
    if (interval > 1) return Math.floor(interval) + " years ago";
    interval = seconds / 2592000;
    if (interval > 1) return Math.floor(interval) + " months ago";
    interval = seconds / 86400;
    if (interval > 1) return Math.floor(interval) + " days ago";
    interval = seconds / 3600;
    if (interval > 1) return Math.floor(interval) + " hours ago";
    interval = seconds / 60;
    if (interval > 1) return Math.floor(interval) + " minutes ago";
    return "Just now";
};

// --- Component: Independent Assignment Card ---
const AssignmentCard = ({ repo, index, onRemove }: { repo: ClassroomRepo; index: number; onRemove: (id: number) => void }) => {
    const [progress, setProgress] = useState<ProgressData | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [expanded, setExpanded] = useState<boolean>(false);
    const [fetchError, setFetchError] = useState<string | null>(null);

    const fetchCardProgress = async (forceRefresh = false) => {
        setLoading(true);
        setFetchError(null);
        try {
            const cacheKey = `progress_${repo.fullName}`;
            const cached = await get<ProgressData>(cacheKey);

            if (cached && !forceRefresh) {
                // 🖥️ CLIENT LOG: Confirms data loaded instantly from DB without hitting server
                console.info(`📦 [CACHE HIT] Loaded ${repo.name} instantly from IndexedDB.`);
                setProgress(cached);
                setLoading(false);
                return;
            }

            // 🌐 CLIENT LOG: Confirms we are asking the server for fresh data
            console.info(`🌐 [NETWORK] Requesting fresh logs for ${repo.name} from server...`);

            const res = await fetch('/api/progress', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ repoPath: repo.fullName }),
            });

            const data = await res.json();

            if (!res.ok) {
                // Friendly error for GitHub rate limits / timeouts
                if (res.status === 500) throw new Error("GitHub API Timeout. Click Sync.");
                throw new Error(data.error || 'Failed to fetch logs');
            }

            setProgress(data);
            await set(cacheKey, data);
            console.info(`✅ [SAVED] Fresh data for ${repo.name} saved to IndexedDB.`);
        } catch (err: unknown) {
            const errorMessage = err instanceof Error ? err.message : 'Unknown error';
            console.error(`Error on ${repo.name}:`, errorMessage);
            setFetchError(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        // Multiply the card's position by 400ms. 
        // Card 1 fetches instantly. Card 10 waits 4 seconds.
        const cascadeDelay = index * 400;

        const timer = setTimeout(() => {
            fetchCardProgress();
        }, cascadeDelay);

        return () => clearTimeout(timer);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [repo.fullName]);

    // Determine Status Badge
    let statusConfig = { text: 'Scanning...', classes: 'bg-gray-800 text-gray-400' };
    if (fetchError) {
        statusConfig = { text: '❌ Error', classes: 'bg-[#da3633]/20 text-[#ff7b72] border-[#da3633]/30' };
    } else if (!loading && progress) {
        if (progress.totalMax > 0 && progress.totalEarned === progress.totalMax) {
            statusConfig = { text: '✓ Completed', classes: 'bg-[#238636]/20 text-[#3fb950] border-[#3fb950]/30' };
        } else if (progress.totalEarned > 0) {
            statusConfig = { text: '⚠️ In Progress', classes: 'bg-[#d29922]/20 text-[#e3b341] border-[#e3b341]/30' };
        } else {
            statusConfig = { text: '⏳ Pending', classes: 'bg-gray-800 text-gray-400 border-gray-600' };
        }
    }

    const cleanName = repo.name.replace(/-[a-zA-Z0-9]+$/, '');

    return (
        <div className="bg-[#161b22] border border-[#30363d] rounded-xl overflow-hidden shadow-lg flex flex-col transition-all hover:border-[#8b949e]">
            {/* Card Header */}
            <div className="p-5 flex flex-col gap-4">
                <div className="flex justify-between items-start">
                    <div className="overflow-hidden pr-2">
                        <h3 className="font-bold text-lg text-white truncate" title={repo.name}>
                            {cleanName}
                        </h3>
                        <p className="text-xs text-gray-400 mt-1">Updated {timeAgo(repo.updatedAt)}</p>
                    </div>
                    <span className={`whitespace-nowrap text-xs px-2 py-1 rounded-full border font-bold ${statusConfig.classes}`}>
                        {statusConfig.text}
                    </span>
                </div>

                {loading ? (
                    <div className="h-10 flex items-center text-sm text-gray-500 animate-pulse">
                        Parsing workflow logs...
                    </div>
                ) : fetchError ? (
                    <div className="h-10 flex flex-col justify-center text-sm text-[#ff7b72]">
                        <span className="truncate" title={fetchError}>{fetchError}</span>
                    </div>
                ) : progress ? (
                    <div className="space-y-2">
                        <div className="flex justify-between items-end">
                            <span className="text-3xl font-bold text-white">
                                {progress.totalEarned} <span className="text-lg text-gray-500">/ {progress.totalMax}</span>
                            </span>
                            <span className="text-xs font-mono text-[#58a6ff]">Commit: {progress.commit}</span>
                        </div>
                        <div className="w-full bg-[#0d1117] rounded-full h-2 overflow-hidden border border-[#30363d]">
                            <div
                                className={`h-full transition-all duration-1000 ${progress.totalEarned === progress.totalMax ? 'bg-[#238636]' :
                                    progress.totalEarned > 0 ? 'bg-[#d29922]' : 'bg-[#da3633]'
                                    }`}
                                style={{ width: `${progress.totalMax > 0 ? (progress.totalEarned / progress.totalMax) * 100 : 0}%` }}
                            ></div>
                        </div>
                    </div>
                ) : null}
            </div>

            {/* Card Footer Actions */}
            <div className="bg-[#0d1117] border-t border-[#30363d] px-5 py-3 flex justify-between items-center mt-auto">
                <div className="flex gap-3">
                    <a
                        href={`https://github.com/${repo.fullName}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-gray-400 hover:text-white transition-colors flex items-center gap-1"
                    >
                        ↗️ Repo
                    </a>

                    {/* UI FIX: Only show remove button if the user manually added it AND it threw an error */}
                    {repo.isManual && fetchError && (
                        <button
                            onClick={() => onRemove(repo.id)}
                            className="text-xs text-[#ff7b72] hover:text-red-400 transition-colors"
                        >
                            🗑️ Remove
                        </button>
                    )}
                </div>

                <div className="flex gap-3">
                    <button
                        onClick={() => fetchCardProgress(true)}
                        disabled={loading}
                        className="text-xs text-gray-400 hover:text-white disabled:opacity-50"
                        title="Force refresh logs from GitHub"
                    >
                        🔄 Sync
                    </button>
                    <button
                        onClick={() => setExpanded(!expanded)}
                        disabled={loading || !progress || !!fetchError}
                        className="text-sm text-[#58a6ff] hover:text-[#79c0ff] disabled:opacity-50 font-medium"
                    >
                        {expanded ? 'Hide ▲' : 'Details ▼'}
                    </button>
                </div>
            </div>

            {/* Expanded Granular Tests */}
            {expanded && progress && (
                <div className="px-5 pb-5 pt-2 bg-[#0d1117] border-t border-[#30363d] grid grid-cols-1 gap-2 max-h-60 overflow-y-auto">
                    {progress.results.map((test, idx) => (
                        <div key={idx} className="flex justify-between items-center text-sm p-2 rounded bg-[#161b22] border border-[#30363d]">
                            <span className="text-gray-300 truncate pr-2" title={test.test}>{test.test}</span>
                            <span className={`font-mono text-xs ${test.status === 'passed' ? 'text-[#3fb950]' : test.status === 'pending' ? 'text-[#e3b341]' : 'text-[#ff7b72]'}`}>
                                {test.earned}/{test.max}
                            </span>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

// --- Main Dashboard Page ---
export default function Dashboard() {
    const { data: session, status } = useSession();
    const [repos, setRepos] = useState<ClassroomRepo[]>([]);
    const [loadingRepos, setLoadingRepos] = useState<boolean>(false);
    const [manualInput, setManualInput] = useState<string>('');
    const [errorMsg, setErrorMsg] = useState<string | null>(null);

    useEffect(() => {
        if (status === 'authenticated') {
            loadReposFromDB();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [status]);

    const loadReposFromDB = async () => {
        try {
            const cachedRepos = await get<ClassroomRepo[]>('cac_repos');
            if (cachedRepos && cachedRepos.length > 0) {
                setRepos(cachedRepos);
            } else {
                fetchReposFromServer();
            }
        } catch (err) {
            console.error("IndexedDB Error:", err);
            fetchReposFromServer();
        }
    };

    const fetchReposFromServer = async () => {
        setLoadingRepos(true);
        setErrorMsg(null);
        try {
            const res = await fetch('/api/repos');
            const data = await res.json();
            if (res.ok) {
                setRepos(prevRepos => {
                    const existingPaths = new Set(prevRepos.map(r => r.fullName.toLowerCase()));
                    const newUniqueRepos = data.repos.filter((r: ClassroomRepo) => !existingPaths.has(r.fullName.toLowerCase()));
                    const combined = [...newUniqueRepos, ...prevRepos];
                    set('cac_repos', combined).catch(console.error);
                    return combined;
                });
            } else {
                throw new Error(data.error);
            }
        } catch (err: unknown) {
            const errorMessage = err instanceof Error ? err.message : 'Unknown error';
            console.error(errorMessage);
            setErrorMsg("Failed to auto-scan organization. Try adding repos manually.");
        } finally {
            setLoadingRepos(false);
        }
    };

    const handleManualSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setErrorMsg(null);
        if (!manualInput) return;

        const cleanPath = sanitizeRepoInput(manualInput);

        if (repos.some(r => r.fullName.toLowerCase() === cleanPath.toLowerCase())) {
            setManualInput('');
            return;
        }

        const newRepo: ClassroomRepo = {
            id: Date.now(),
            name: cleanPath.split('/')[1],
            fullName: cleanPath,
            url: `https://github.com/${cleanPath}`,
            updatedAt: new Date().toISOString(),
            isManual: true // <-- FLAGS THIS FOR DELETION UI
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

    if (status === "loading") return <div className="min-h-screen bg-[#0d1117] flex items-center justify-center text-white">Initializing System...</div>;

    if (!session) {
        return (
            <div className="min-h-screen bg-[#0d1117] flex flex-col items-center justify-center text-white p-4">
                <div className="bg-[#161b22] border border-[#30363d] p-8 rounded-xl max-w-md w-full text-center shadow-2xl">
                    <h1 className="text-2xl font-bold mb-2">Assignment Progress Visualizer</h1>
                    <p className="text-gray-400 mb-6 text-sm">Authenticate to securely read GitHub Classroom autograding logs.</p>
                    <button onClick={() => signIn('github')} className="w-full bg-[#238636] hover:bg-[#2ea043] text-white px-6 py-3 rounded-md font-bold transition-colors">
                        Login with GitHub
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#0d1117] text-[#c9d1d9] font-sans flex flex-col">
            <header className="bg-[#161b22] border-b border-[#30363d] p-4 flex flex-col md:flex-row justify-between items-center sticky top-0 z-50 gap-4 md:gap-0 shadow-sm">
                <div className="flex flex-col md:flex-row items-center gap-6 w-full md:w-auto">
                    <h1 className="text-xl font-bold text-white whitespace-nowrap">Progress Visualizer</h1>

                    <form onSubmit={handleManualSubmit} className="flex items-center gap-2 w-full md:w-auto">
                        <input
                            className="bg-[#0d1117] border border-[#30363d] px-3 py-1.5 text-sm rounded-md focus:outline-none focus:border-[#58a6ff] w-full md:w-80 transition-colors"
                            placeholder="Paste GitHub URL or assignment name..."
                            value={manualInput}
                            onChange={(e) => setManualInput(e.target.value)}
                        />
                        <button type="submit" className="bg-[#21262d] border border-[#30363d] hover:bg-[#30363d] px-4 py-1.5 rounded-md text-sm transition-colors font-medium">
                            Add
                        </button>
                    </form>
                </div>

                <div className="flex items-center gap-4">
                    <button onClick={fetchReposFromServer} disabled={loadingRepos} className="text-sm text-[#58a6ff] hover:text-[#79c0ff] disabled:opacity-50 transition-opacity">
                        {loadingRepos ? 'Scanning...' : '🔄 Rescan Connect'}
                    </button>
                    <div className="h-6 w-px bg-[#30363d]"></div>
                    <div className="flex items-center gap-2">
                        {session.user?.image && (
                            <img src={session.user.image} alt="Profile" className="w-8 h-8 rounded-full border border-[#30363d]" />
                        )}
                    </div>
                    <button onClick={async () => { await set('cac_repos', []); signOut(); }} className="text-xs bg-[#21262d] hover:bg-[#30363d] border border-[#363b42] px-3 py-1.5 rounded-md transition-colors">
                        Sign Out
                    </button>
                </div>
            </header>

            {errorMsg && (
                <div className="bg-[#da3633]/10 border-b border-[#da3633]/30 text-[#ff7b72] text-center p-2 text-sm font-medium">
                    ⚠️ {errorMsg}
                </div>
            )}

            <main className="flex-1 p-6 md:p-8 max-w-400 mx-auto w-full">
                {repos.length === 0 && !loadingRepos ? (
                    <div className="flex flex-col items-center justify-center text-gray-500 mt-20 p-8 border border-dashed border-[#30363d] rounded-xl max-w-lg mx-auto bg-[#161b22]/50">
                        <span className="text-4xl mb-4">📭</span>
                        <p className="text-lg font-medium text-gray-300">No assignments found.</p>
                        <p className="text-sm mt-2 text-center">Paste a GitHub URL in the top bar to track a repository manually, or hit Rescan.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {repos.map((repo, idx) => (
                            <AssignmentCard
                                key={repo.id}
                                repo={repo}
                                index={idx}
                                onRemove={handleRemoveRepo}
                            />
                        ))}
                    </div>
                )}
            </main>
        </div>
    );
}