'use client';

// import Image from "next/image";
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';
import { GitHubLoginButton } from '@/app/_components/GitHubLoginButton';

export default function Navbar() {
    const pathname = usePathname();
    const { data: session, status } = useSession();

    // Helper to determine if a link is active
    const isActive = (path: string) => pathname === path;

    const isDemo = pathname === '/demo';

    if (pathname === '/' || pathname === '/v0') return null;

    return (
        <header className="app-header w-full max-w-7xl mx-auto px-6 py-4 flex justify-between items-center border-b border-ui-border-light bg-brand-dark/80 backdrop-blur-md sticky top-0 z-50">

            {/* Left: Brand / Logo */}
            <div className="flex-1">
                <Link href="/" className="flex items-center gap-3 w-fit">
                    <div className="flex">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <rect width="24" height="24" rx="4" fill="#FF5B14" />
                        </svg>
                    </div>
                    <div className="flex flex-col">
                        <span className="font-display font-bold text-base leading-none tracking-tight text-white">GradeVisualizer</span>
                        {isDemo && (
                            <span className="text-[0.55rem] text-brand-orange font-semibold tracking-widest mt-0.5 uppercase">LIVE DEMO</span>
                        )}
                    </div>
                </Link>
            </div>

            {/* Middle: Dynamic Navigation */}
            {isDemo ? (
                <nav className="hidden md:flex h-full">
                    <Link href="/" className="px-4 flex items-center text-text-muted text-[13px] font-medium transition-colors hover:text-brand-orange">
                        Exit Demo
                    </Link>
                </nav>
            ) : (
                <nav className="hidden md:flex h-full items-center gap-2">
                    <Link
                        href="/dashboard"
                        className={`h-16 px-4 flex items-center text-[13px] font-medium relative transition-colors ${isActive('/dashboard') ? "text-text-primary after:content-[''] after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-brand-orange" : "text-text-muted hover:text-text-primary"}`}
                    >
                        Control Room
                    </Link>
                    <Link
                        href={pathname.startsWith('/assignment') ? pathname : '#'}
                        className={`h-16 px-4 flex items-center text-[13px] font-medium relative transition-colors ${pathname.startsWith('/assignment') ? "text-text-primary after:content-[''] after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-brand-orange" : "text-text-muted cursor-not-allowed opacity-50"}`}
                        title={pathname.startsWith('/assignment') ? "Active Inspector" : "Select a repo to inspect"}
                    >
                        Inspector
                    </Link>
                </nav>
            )}

            {/* Right: Utilities & Auth */}
            <div className="flex-1 flex justify-end items-center gap-4">

                {/* Inject the simulated data warning ONLY on the demo page */}
                {isDemo && (
                    <div className="hidden md:flex items-center gap-2 font-mono text-xs text-brand-orange mr-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-brand-orange shadow-[0_0_8px_#FF5B14] animate-pulse"></div>
                        simulated data
                    </div>
                )}

                {status === 'authenticated' && !isDemo ? (
                    <div className="flex items-center gap-0 bg-ui-card border border-ui-border-light rounded-md">
                        <div className="flex items-center gap-2 px-3 h-8 text-[13px] text-text-primary font-medium border-r border-ui-border-light">
                            <img src={session?.user?.image || ''} alt="Profile" className="w-5 h-5 rounded-full" />
                            {session?.user?.name?.split(' ')[0] || 'Developer'}
                        </div>
                        <button
                            onClick={() => {
                                sessionStorage.clear();
                                signOut({ callbackUrl: '/' });
                            }}
                            title="Disconnect Session"
                            className="px-3 h-8 flex items-center justify-center text-text-muted hover:text-brand-red hover:bg-white/5 transition-colors rounded-r-md cursor-pointer"
                        >
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>
                        </button>
                    </div>
                ) : (status === 'authenticated' ?
                    (
                        <Link href="/dashboard" className="flex items-center text-sm font-medium px-4 py-2 rounded-md border border-ui-border-light bg-white/[0.03] text-text-primary transition-all duration-200 hover:bg-white/10 hover:border-white/20">
                            Go to Dashboard
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="ml-2">
                                <line x1="5" y1="12" x2="19" y2="12"></line>
                                <polyline points="12 5 19 12 12 19"></polyline>
                            </svg>
                        </Link>
                    )
                    : (
                        <GitHubLoginButton />
                    )
                )}
            </div>
        </header>
    );
}

