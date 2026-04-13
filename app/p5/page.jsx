'use client';
import { useState, useEffect } from 'react';
import { useSession, signIn, signOut } from "next-auth/react";

// --- Utility: Formats date to "2 days ago" ---
const timeAgo = (dateString) => {
    if (!dateString) return 'Just now';
    const seconds = Math.floor((new Date() - new Date(dateString)) / 1000);
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
const AssignmentCard = ({ repo }) => {
    const [progress, setProgress] = useState(null);
    const [loading, setLoading] = useState(true);
    const [expanded, setExpanded] = useState(false);

    const fetchCardProgress = async (forceRefresh = false) => {
        setLoading(true);
        try {
            const cacheKey = `progress_${repo.fullName}`;
            const cached = sessionStorage.getItem(cacheKey);
            
            if (cached && !forceRefresh) {
                setProgress(JSON.parse(cached));
                setLoading(false);
                return;
            }

            const res = await fetch('/api/progress', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ repoPath: repo.fullName }),
            });
            
            const data = await res.json();
            if (res.ok) {
                setProgress(data);
                sessionStorage.setItem(cacheKey, JSON.stringify(data));
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    // Auto-fetch on mount
    useEffect(() => {
        fetchCardProgress();
    }, [repo.fullName]);

    // Determine Status Badge
    let statusConfig = { text: 'Scanning...', classes: 'bg-gray-800 text-gray-400' };
    if (!loading && progress) {
        if (progress.totalMax > 0 && progress.totalEarned === progress.totalMax) {
            statusConfig = { text: '✓ Completed', classes: 'bg-[#238636]/20 text-[#3fb950] border-[#3fb950]/30' };
        } else if (progress.totalEarned > 0) {
            statusConfig = { text: '⚠️ In Progress', classes: 'bg-[#d29922]/20 text-[#e3b341] border-[#e3b341]/30' };
        } else {
            statusConfig = { text: '⏳ Pending', classes: 'bg-gray-800 text-gray-400 border-gray-600' };
        }
    }

    return (
        <div className="bg-[#161b22] border border-[#30363d] rounded-xl overflow-hidden shadow-lg flex flex-col">
            {/* Card Header (Compact Overview) */}
            <div className="p-5 flex flex-col gap-4">
                <div className="flex justify-between items-start">
                    <div>
                        <h3 className="font-bold text-lg text-white truncate" title={repo.name}>
                            {repo.name.replace('-triloksh07', '')}
                        </h3>
                        <p className="text-xs text-gray-400 mt-1">Updated {timeAgo(repo.updatedAt)}</p>
                    </div>
                    <span className={`text-xs px-2 py-1 rounded-full border font-bold ${statusConfig.classes}`}>
                        {statusConfig.text}
                    </span>
                </div>

                {loading ? (
                    <div className="h-10 flex items-center text-sm text-gray-500 animate-pulse">
                        Parsing workflow logs...
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
                                className={`h-full transition-all duration-1000 ${
                                    progress.totalEarned === progress.totalMax ? 'bg-[#238636]' : 
                                    progress.totalEarned > 0 ? 'bg-[#d29922]' : 'bg-[#da3633]'
                                }`}
                                style={{ width: `${progress.totalMax > 0 ? (progress.totalEarned / progress.totalMax) * 100 : 0}%` }}
                            ></div>
                        </div>
                    </div>
                ) : (
                    <div className="h-10 flex items-center text-sm text-red-400">Failed to load logs.</div>
                )}
            </div>

            {/* Card Footer Actions */}
            <div className="bg-[#0d1117] border-t border-[#30363d] px-5 py-3 flex justify-between items-center">
                <button 
                    onClick={() => setExpanded(!expanded)}
                    disabled={loading || !progress}
                    className="text-sm text-[#58a6ff] hover:text-[#79c0ff] disabled:opacity-50"
                >
                    {expanded ? 'Hide Details ▲' : 'View Granular Tests ▼'}
                </button>
                <button 
                    onClick={() => fetchCardProgress(true)}
                    disabled={loading}
                    className="text-xs text-gray-400 hover:text-white disabled:opacity-50"
                >
                    🔄 Sync
                </button>
            </div>

            {/* Expanded Granular Tests */}
            {expanded && progress && (
                <div className="px-5 pb-5 pt-2 bg-[#0d1117] border-t border-[#30363d] grid grid-cols-1 gap-2 max-h-60 overflow-y-auto">
                    {progress.results.map((test, idx) => (
                        <div key={idx} className="flex justify-between items-center text-sm p-2 rounded bg-[#161b22] border border-[#30363d]">
                            <span className="text-gray-300 truncate pr-2">{test.test}</span>
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
    const [repos, setRepos] = useState([]);
    const [loadingRepos, setLoadingRepos] = useState(false);
    const [manualInput, setManualInput] = useState('');

    useEffect(() => {
        if (status === 'authenticated') fetchRepos();
    }, [status]);

    const fetchRepos = async (forceRefresh = false) => {
        setLoadingRepos(true);
        try {
            const cachedRepos = sessionStorage.getItem('cac_repos');
            if (cachedRepos && !forceRefresh) {
                setRepos(JSON.parse(cachedRepos));
                setLoadingRepos(false);
                return;
            }
            const res = await fetch('/api/repos');
            const data = await res.json();
            if (res.ok) {
                setRepos(data.repos);
                sessionStorage.setItem('cac_repos', JSON.stringify(data.repos));
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoadingRepos(false);
        }
    };

    // 1. Manually add repo, inject into state, and persist to cache
    const handleManualSubmit = (e) => {
        e.preventDefault();
        if (!manualInput) return;
        
        const path = manualInput.includes('/') ? manualInput : `chaicodehq/${manualInput}`;
        
        // Prevent duplicates
        if (repos.some(r => r.fullName.toLowerCase() === path.toLowerCase())) {
            setManualInput('');
            return;
        }

        const newRepo = {
            id: Date.now(), 
            name: path.split('/')[1],
            fullName: path,
            updatedAt: new Date().toISOString()
        };

        const updatedRepos = [newRepo, ...repos];
        setRepos(updatedRepos);
        sessionStorage.setItem('cac_repos', JSON.stringify(updatedRepos));
        setManualInput('');
    };

    if (status === "loading") return <div className="min-h-screen bg-[#0d1117] flex items-center justify-center text-white">Initializing Engine...</div>;

    if (!session) {
        return (
            <div className="min-h-screen bg-[#0d1117] flex flex-col items-center justify-center text-white p-4">
                <div className="bg-[#161b22] border border-[#30363d] p-8 rounded-xl max-w-md w-full text-center shadow-2xl">
                    <h1 className="text-2xl font-bold mb-2">Progress Visualizer</h1>
                    <p className="text-gray-400 mb-6 text-sm">Authenticate to read GitHub Classroom autograding logs.</p>
                    <button onClick={() => signIn('github')} className="w-full bg-[#238636] hover:bg-[#2ea043] text-white px-6 py-3 rounded-md font-bold transition-colors">
                        Login with GitHub
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#0d1117] text-[#c9d1d9] font-sans flex flex-col">
            {/* Top Navigation */}
            <header className="bg-[#161b22] border-b border-[#30363d] p-4 flex justify-between items-center sticky top-0 z-50">
                <div className="flex items-center gap-6">
                    <h1 className="text-xl font-bold text-white">Chai Aur Code Cohort</h1>
                    
                    {/* Manual Override Input moved to top bar */}
                    <form onSubmit={handleManualSubmit} className="hidden md:flex items-center gap-2">
                        <input 
                            className="bg-[#0d1117] border border-[#30363d] px-3 py-1.5 text-sm rounded-md focus:outline-none focus:border-[#58a6ff] w-64"
                            placeholder="Add missing repo (e.g. js-basics)"
                            value={manualInput}
                            onChange={(e) => setManualInput(e.target.value)}
                        />
                        <button type="submit" className="bg-[#21262d] border border-[#30363d] hover:bg-[#30363d] px-3 py-1.5 rounded-md text-sm transition-colors">
                            Add
                        </button>
                    </form>
                </div>

                <div className="flex items-center gap-4">
                    <button onClick={() => fetchRepos(true)} className="text-sm text-[#58a6ff] hover:text-[#79c0ff]">
                        🔄 Rescan Org
                    </button>
                    <div className="h-6 w-px bg-[#30363d]"></div>
                    <div className="flex items-center gap-2">
                        <img src={session.user.image} alt="Profile" className="w-8 h-8 rounded-full" />
                    </div>
                    <button onClick={() => { sessionStorage.clear(); signOut(); }} className="text-xs bg-[#21262d] hover:bg-[#30363d] border border-[#363b42] px-3 py-1.5 rounded-md transition-colors">
                        Sign Out
                    </button>
                </div>
            </header>

            {/* Main Grid View */}
            <main className="flex-1 p-6 md:p-8 max-w-[1600px] mx-auto w-full">
                {loadingRepos ? (
                    <div className="text-center text-gray-500 mt-20 text-lg">Scanning organization repositories...</div>
                ) : repos.length === 0 ? (
                    <div className="text-center text-gray-500 mt-20 text-lg">No assignments found. Add one manually above.</div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {repos.map(repo => (
                            <AssignmentCard key={repo.id} repo={repo} />
                        ))}
                    </div>
                )}
            </main>
        </div>
    );
}