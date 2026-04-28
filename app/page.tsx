import Link from 'next/link';
import { getServerSession } from 'next-auth/next';
import { authOptions } from "@/lib/auth";
import { signIn } from 'next-auth/react';
import { GitHubLoginButton, GitHubLoginButtonBottom, GitHubLoginButtonNavbar } from '@/app/_components/GitHubLoginButton';

export default async function LandingPage() {
    const session = await getServerSession(authOptions);

    return (
        <div className="relative flex flex-col items-center min-h-screen bg-brand-dark text-text-primary font-sans overflow-x-hidden">

            {/* Background glow effects */}
            <div className="absolute top-[10%] left-0 w-[60vw] h-[60vh] bg-[radial-gradient(ellipse_at_left,rgba(255,91,20,0.15)_0%,rgba(0,0,0,0)_60%)] blur-[100px] z-0 pointer-events-none rounded-full" />

            {/* Navigation */}
            <header className="w-full max-w-300 px-6 py-8 flex justify-between items-center z-10 relative">
                <div className="flex items-center gap-3 font-bold text-lg tracking-tight">
                    <span className="flex">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <rect width="24" height="24" rx="4" className="fill-brand-orange" />
                            <path d="M8 17L14 12L8 7" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                    </span>
                    <span className="font-display">GradeVisualizer</span>
                </div>

                <nav className="hidden md:flex gap-8 text-sm text-text-muted font-medium">
                    <Link href="#features" className="hover:text-text-primary transition-colors">Features</Link>
                    <Link href="#security" className="hover:text-text-primary transition-colors">Security</Link>
                    <Link href="/demo" className="hover:text-text-primary transition-colors">Demo</Link>
                </nav>

                {/* Server-Side Conditional Rendering */}
                {session ? (
                    <Link href="/dashboard" className="flex items-center text-sm font-medium px-4 py-2 rounded-md border border-ui-border-light bg-white/[0.03] text-text-primary transition-all duration-200 hover:bg-white/10 hover:border-white/20">
                        Go to Dashboard
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="ml-2">
                            <line x1="5" y1="12" x2="19" y2="12"></line>
                            <polyline points="12 5 19 12 12 19"></polyline>
                        </svg>
                    </Link>
                ) : (
                    <GitHubLoginButtonNavbar />
                )}
            </header>

            <main className="w-full max-w-300 px-6 flex flex-col gap-32 z-10 relative">

                {/* Hero Section */}
                <section className="grid grid-cols-1 lg:grid-cols-2 gap-16 mt-16 items-center">
                    <div className="flex flex-col items-center md:items-start text-center md:text-left gap-6">

                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-ui-card border border-ui-border-light text-xs text-text-muted font-mono">
                            <span className="w-2 h-2 rounded-full bg-brand-orange"></span>
                            The ultimate GitHub Classroom companion
                        </div>

                        <h1 className="text-[2rem] md:text-[3rem] leading-[1.1] font-extrabold font-display tracking-tight">
                            All Your Classroom <br />
                            Assignments <br />
                            <span className="text-gradient">in One Place.</span>
                        </h1>

                        <p className="text-lg text-text-muted max-w-[90%] leading-relaxed">
                            A unified dashboard for GitHub Classroom. Track all your assignment grades, view test logs, and jump straight to any repository in one click. Skip the GitHub UI navigation and get back to coding.
                        </p>

                        <div className="flex flex-wrap justify-center md:justify-start gap-4 mt-2 w-full">

                            <GitHubLoginButton />

                            <Link href="/demo" className="inline-flex items-center gap-2 px-6 py-3 rounded-md font-semibold text-[14px] bg-transparent text-text-primary border border-ui-border-light hover:bg-white/5 transition-colors">
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                                    <circle cx="12" cy="12" r="3"></circle>
                                </svg>
                                See it live
                            </Link>
                        </div>

                        <div id="security" className="mt-8 bg-ui-card border border-ui-border-light rounded-xl p-5 flex flex-col sm:flex-row gap-4 items-center sm:items-start w-full max-w-[90%] mx-auto md:mx-0">
                            {/* The Icon */}
                            <div className="w-10 h-10 rounded-lg bg-status-green/10 text-status-green flex items-center justify-center shrink-0 border border-status-green/20 sm:mt-0.5">
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
                                    <path d="M9 12l2 2 4-4"></path>
                                </svg>
                            </div>

                            {/* The Content */}
                            <div className="flex flex-col flex-1 text-center sm:text-left w-full">
                                <h3 className="text-[15px] mb-1 font-semibold text-white">Secure, Server-Side Authentication</h3>
                                <p className="text-[15px] text-text-muted leading-relaxed">
                                    Requires <strong>read-only</strong> access to specific repository scopes.
                                </p>

                                {/* Dedicated Flex Container for the Badges */}
                                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 mt-3">
                                    <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded bg-white/5 border border-ui-border-light font-mono text-[11px] text-text-primary shadow-sm">
                                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
                                        Actions
                                    </span>
                                    <span className="text-[11px] text-text-dim font-medium">&amp;</span>
                                    <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded bg-white/5 border border-ui-border-light font-mono text-[11px] text-text-primary shadow-sm">
                                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path></svg>
                                        Contents
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div className="flex gap-6 mt-4 flex-wrap justify-center md:justify-start w-full">
                            <span className="flex items-center gap-2 text-[13px] text-text-dim font-medium">
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#FF5B14" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><rect x="7" y="7" width="3" height="9"></rect><rect x="14" y="7" width="3" height="5"></rect></svg>
                                Unified Dashboard
                            </span>
                            <span className="flex items-center gap-2 text-[13px] text-text-dim font-medium">
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#3498DB" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
                                Instant Log Parsing
                            </span>
                        </div>
                    </div>

                    <div className="perspective-[1000px] flex flex-col gap-8 relative items-end">

                        {/* Dashboard Mockup Panel */}
                        <div className="bg-brand-panel rounded-xl border border-[#333] shadow-[0_25px_50px_-12px_rgba(0,0,0,0.5)] w-full overflow-hidden mb-12 mx-auto lg:mx-0">
                            <div className="h-12 border-b border-[#333] flex items-center px-4 justify-between">
                                <div className="flex gap-1.5">
                                    <div className="w-3 h-3 rounded-md bg-brand-orange"></div>
                                </div>
                                <div className="flex gap-3 grow ml-6">
                                    <div className="bg-white/4 border border-white/5 rounded-md py-1.5 px-3 flex items-center gap-2 min-w-[100px]">
                                        <div className="w-2 h-2 rounded-full bg-status-green"></div>
                                        <div className="flex flex-col gap-1 grow">
                                            <div className="h-1 bg-white/20 rounded-full w-full"></div>
                                            <div className="h-1 bg-white/10 rounded-full w-[60%]"></div>
                                        </div>
                                    </div>
                                    <div className="bg-white/4 border border-white/5 rounded-md py-1.5 px-3 flex items-center gap-2 min-w-[100px]">
                                        <div className="w-2 h-2 rounded-full bg-status-blue"></div>
                                        <div className="flex flex-col gap-1 grow">
                                            <div className="h-1 bg-white/20 rounded-full w-full"></div>
                                            <div className="h-1 bg-white/10 rounded-full w-[60%]"></div>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex gap-1">
                                    <div className="w-5 h-1 bg-white/10 rounded-full"></div>
                                    <div className="w-5 h-1 bg-white/10 rounded-full"></div>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4 p-6">
                                <div className="bg-white/3 border border-white/5 rounded-lg p-4">
                                    <div className="flex justify-between text-xs text-text-muted font-display font-medium mb-3">
                                        <span>JS LOOPS</span>
                                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
                                    </div>
                                    <div className="flex items-baseline gap-0.5 mb-3">
                                        <strong className="text-2xl font-bold text-white">80</strong><span className="text-xs text-text-dim">/100</span>
                                    </div>
                                    <div className="bg-white/10 h-1 rounded-full overflow-hidden">
                                        <div className="h-full rounded-full bg-status-green" style={{ width: '80%' }}></div>
                                    </div>
                                </div>

                                <div className="bg-white/3 border border-status-blue/30 shadow-[0_0_15px_rgba(52,152,219,0.1)] rounded-lg p-4">
                                    <div className="flex justify-between text-xs text-status-blue font-display font-medium mb-3">
                                        <span className="flex items-center gap-2">
                                            <span className="w-1.5 h-1.5 bg-status-blue rounded-full animate-pulse"></span>
                                            Syncing
                                        </span>
                                    </div>
                                    <div className="flex items-baseline gap-0.5 mb-3">
                                        <strong className="text-2xl font-bold text-text-dim">62</strong><span className="text-xs text-text-dim">/100</span>
                                    </div>
                                    <div className="bg-white/10 h-1 rounded-full overflow-hidden">
                                        <div className="h-full rounded-full bg-status-blue" style={{ width: '62%' }}></div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Terminal Window - Updated to show workflow instead of architecture */}
                        <div className="bg-brand-terminal rounded-lg border border-[#333] w-[90%] ml-auto shadow-[0_25px_50px_-12px_rgba(0,0,0,0.5)] font-mono overflow-hidden -mt-8 relative z-10 mx-auto lg:mx-0">
                            <div className="h-8 bg-brand-panel border-b border-[#333] flex items-center px-4">
                                <div className="flex gap-1.5">
                                    <div className="w-2.5 h-2.5 rounded-full bg-[#FF5F56]"></div>
                                    <div className="w-2.5 h-2.5 rounded-full bg-[#FFBD2E]"></div>
                                    <div className="w-2.5 h-2.5 rounded-full bg-[#27C93F]"></div>
                                </div>
                                <div className="grow text-center text-xs text-text-dim mr-11.5">
                                    ~/classroom-sync
                                </div>
                            </div>
                            <div className="p-6 text-text-muted text-[13px] leading-relaxed">
                                <div className="mb-1">
                                    <span className="text-text-dim mr-2">$</span> <span className="text-white">git push origin main</span>
                                </div>
                                <div className="mb-1 mt-3">
                                    <span className="text-status-blue mr-2">➜</span> Detecting changes across organization...
                                </div>
                                <div className="mb-1">
                                    <span className="text-text-dim mr-2">➜</span> Found new commit in <span className="text-white">js-dom</span>
                                </div>
                                <div className="mb-1">
                                    <span className="text-text-dim mr-2">➜</span> Extracting autograder test results...
                                </div>
                                <div className="mb-1">
                                    <span className="text-status-green mr-2">✓</span> <span className="text-white">js-dom</span>: 95/100
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Feature Highlights Group */}
                <section id="features" className="flex flex-col gap-12 mt-8">
                    <div className="flex flex-col gap-4 items-center text-center md:items-start md:text-left">
                        <p className="label-micro">WORKFLOW OPTIMIZATION</p>
                        <div className="flex flex-col md:flex-row justify-between items-center lg:items-end gap-6 w-full">
                            <h2 className="text-[2.3rem] md:text-[3rem] leading-[1.1] font-display tracking-tight">
                                Built for developers who <br />
                                <span className="text-gradient">value their time.</span>
                            </h2>
                            <p className="text-text-muted max-w-100 text-base leading-relaxed">
                                Stop hunting for workflow files. We aggregate your classroom data so you can focus on passing the tests, not finding them.
                            </p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="glass-card">
                            <div className="flex justify-between items-start mb-6">
                                <div className="bg-white/5 font-mono text-xs px-2 py-1 rounded text-text-muted">01</div>
                                <div className="w-2 h-2 rounded-full bg-brand-orange shadow-[0_0_8px_#FF5B14]"></div>
                            </div>
                            <h3 className="text-xl font-display text-white mb-3">Centralized Control Room</h3>
                            <p className="text-[14px] text-text-muted leading-relaxed">
                                Monitor every assignment from a single grid. See at a glance what’s pending, what’s passing, and what needs work without opening a dozen tabs.
                            </p>
                        </div>

                        <div className="glass-card">
                            <div className="flex justify-between items-start mb-6">
                                <div className="bg-white/5 font-mono text-xs px-2 py-1 rounded text-text-muted">02</div>
                                <div className="w-2 h-2 rounded-full bg-status-blue shadow-[0_0_8px_#3498DB]"></div>
                            </div>
                            <h3 className="text-xl font-display text-white mb-3">Instant Log Extraction</h3>
                            <p className="text-[14px] text-text-muted leading-relaxed">
                                When a test fails, we parse the AWS logs and highlight the exact error matrix on your dashboard. No more digging through nested GitHub Action runs.
                            </p>
                        </div>

                        <div className="glass-card">
                            <div className="flex justify-between items-start mb-6">
                                <div className="bg-white/5 font-mono text-xs px-2 py-1 rounded text-text-muted">03</div>
                                <div className="w-2 h-2 rounded-full bg-status-green shadow-[0_0_8px_#2ECC71]"></div>
                            </div>
                            <h3 className="text-xl font-display text-white mb-3">Frictionless Syncing</h3>
                            <p className="text-[14px] text-text-muted leading-relaxed">
                                Push your code and keep coding. The background engine automatically detects new commits and updates your scores asynchronously.
                            </p>
                        </div>
                    </div>
                </section>

                {/* CTA Banner */}
                <section className="relative bg-brand-panel border border-ui-border-light rounded-2xl p-16 flex flex-col md:flex-row justify-between items-center overflow-hidden gap-8">
                    <div className="absolute top-0 right-0 w-1/2 h-full bg-[radial-gradient(circle_at_80%_50%,rgba(255,91,20,0.15)_0%,rgba(0,0,0,0)_70%)] pointer-events-none"></div>

                    <div className="z-10 w-full flex flex-col md:flex-row justify-between items-center gap-8 text-center md:text-left">
                        <div>
                            <h2 className="text-[2.3rem] md:text-[2.5rem] leading-[1.1] font-display tracking-tight mb-4">
                                Reclaim your time. Let the <br />
                                <span className="text-gradient">scores come to you.</span>
                            </h2>
                            <p className="text-sm text-text-muted">
                                Free for All · Read-only scopes · Zero configuration
                            </p>
                        </div>
                        <GitHubLoginButtonBottom />
                    </div>
                </section>

            </main>

            {/* Footer */}
            <footer className="w-full max-w-[1200px] px-6 py-12 flex flex-col md:flex-row justify-between items-center gap-4 border-t border-ui-border-light text-text-dim text-xs font-mono mt-16">
                {/* <p>© 2026 GradeVisualizer · MIT License</p> */}
                <p>&copy; {new Date().getFullYear()} GradeVisualizer · MIT License</p>

                <Link
                    href="https://github.com/triloksh07/chai-assignment-progress-visualizer"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-ui-border-light text-white transition-colors hover:bg-white/10 hover:border-white/20 cursor-pointer"
                >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"></path></svg>

                    Contribute on GitHub
                </Link>
            </footer>
        </div>
    );
}