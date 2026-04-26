import Link from 'next/link';

export default function LandingPage() {
  return (
    <div className="relative flex flex-col items-center min-h-screen bg-brand-dark text-text-primary font-sans overflow-x-hidden">

      {/* Background glow effects */}
      <div className="absolute top-[10%] left-0 w-[60vw] h-[60vh] bg-[radial-gradient(ellipse_at_left,_rgba(255,91,20,0.15)_0%,_rgba(0,0,0,0)_60%)] blur-[100px] z-0 pointer-events-none rounded-full" />

      {/* Navigation */}
      <header className="w-full max-w-[1200px] px-6 py-8 flex justify-between items-center z-10 relative">
        <div className="flex items-center gap-3 font-bold text-lg tracking-tight">
          <span className="flex">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect width="24" height="24" rx="4" className="fill-brand-orange" />
              <path d="M8 17L14 12L8 7" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </span>
          <span className="font-display">Telemetry.dev</span>
        </div>

        <nav className="hidden md:flex gap-8 text-sm text-text-muted font-medium">
          <Link href="#architecture" className="hover:text-text-primary transition-colors">Architecture</Link>
          <Link href="#engine-states" className="hover:text-text-primary transition-colors">Engine States</Link>
          <Link href="/main-dashboard" className="hover:text-text-primary transition-colors">Control Room</Link>
        </nav>

        <Link href="/main-dashboard" className="flex items-center text-sm font-medium px-4 py-2 rounded-md border border-ui-border-light bg-white/[0.03] text-text-primary transition-all duration-200 hover:bg-white/10">
          Open Dashboard
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="ml-2">
            <line x1="5" y1="12" x2="19" y2="12"></line>
            <polyline points="12 5 19 12 12 19"></polyline>
          </svg>
        </Link>
      </header>

      <main className="w-full max-w-[1200px] px-6 flex flex-col gap-32 z-10 relative">

        {/* Hero Section */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-16 mt-16 items-center">
          <div className="flex flex-col items-start gap-6">

            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-ui-card border border-ui-border-light text-xs text-text-muted font-mono">
              <span className="w-2 h-2 rounded-full bg-brand-orange"></span>
              The ultimate GitHub Classroom companion
            </div>

            <h1 className="text-[2rem] md:text-[3.5rem] leading-[1.1] font-extrabold font-display tracking-tight">
              All Your Classroom  <br />
              Scores <br />
              <span className="text-gradient">in One Place.</span>
            </h1>

            <p className="text-lg text-text-muted max-w-[90%] leading-relaxed">
              A unified dashboard for GitHub Classroom. Track all your assignment grades, view test logs, and jump straight to any repository in one click. Skip the GitHub UI navigation and get back to coding.
            </p>

            <div className="flex flex-wrap gap-4 mt-2">
              <Link href="/connect" className="btn-primary">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"></path>
                </svg>
                Connect GitHub App
              </Link>
            </div>

            <div className="mt-8 bg-ui-card border border-ui-border-light rounded-xl p-5 flex gap-4 items-start max-w-[90%]">
              <div className="w-10 h-10 rounded-lg bg-status-green/10 text-status-green flex items-center justify-center shrink-0 border border-status-green/20">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
                  <path d="M9 12l2 2 4-4"></path>
                </svg>
              </div>
              <div>
                <h3 className="text-[15px] mb-1 font-semibold">Secure, Server-Side Authentication</h3>
                <p className="text-[13px] text-text-muted leading-relaxed">
                  Requires only <strong>read-only</strong> access to <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-white/5 border border-ui-border-light font-mono text-xs text-text-primary mx-1">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
                    Actions
                  </span> and <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-white/5 border border-ui-border-light font-mono text-xs text-text-primary mx-1">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path></svg>
                    Contents
                  </span>. No sweeping OAuth scopes.
                </p>
              </div>
            </div>

            <div className="flex gap-6 mt-4 flex-wrap">
              <span className="flex items-center gap-2 text-[13px] text-text-dim font-medium">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#FF5B14" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>
                Rate-Limit Safe Concurrency
              </span>
              <span className="flex items-center gap-2 text-[13px] text-text-dim font-medium">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#3498DB" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><ellipse cx="12" cy="5" rx="9" ry="3"></ellipse><path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"></path><path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"></path></svg>
                Offline-First IndexedDB
              </span>
            </div>
          </div>

          <div className="perspective-[1000px] flex flex-col gap-8 relative">

            {/* Dashboard Mockup Panel */}
            <div className="bg-brand-panel rounded-xl border border-[#333] shadow-[0_25px_50px_-12px_rgba(0,0,0,0.5)] w-full overflow-hidden">
              <div className="h-12 border-b border-[#333] flex items-center px-4 justify-between">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-md bg-brand-orange"></div>
                </div>
                <div className="flex gap-3 grow ml-6">
                  <div className="bg-white/[0.04] border border-white/5 rounded-md py-1.5 px-3 flex items-center gap-2 min-w-[100px]">
                    <div className="w-2 h-2 rounded-full bg-status-green"></div>
                    <div className="flex flex-col gap-1 grow">
                      <div className="h-1 bg-white/20 rounded-full w-full"></div>
                      <div className="h-1 bg-white/10 rounded-full w-[60%]"></div>
                    </div>
                  </div>
                  <div className="bg-white/[0.04] border border-white/5 rounded-md py-1.5 px-3 flex items-center gap-2 min-w-[100px]">
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
                <div className="bg-white/[0.03] border border-white/5 rounded-lg p-4">
                  <div className="flex justify-between text-xs text-text-muted font-display font-medium mb-3">
                    <span>CS 101</span>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
                  </div>
                  <div className="flex items-baseline gap-0.5 mb-3">
                    <strong className="text-2xl font-bold text-white">80</strong><span className="text-xs text-text-dim">/100</span>
                  </div>
                  <div className="bg-white/10 h-1 rounded-full overflow-hidden">
                    <div className="h-full rounded-full bg-status-green" style={{ width: '80%' }}></div>
                  </div>
                </div>

                <div className="bg-white/[0.03] border border-status-blue/30 shadow-[0_0_15px_rgba(52,152,219,0.1)] rounded-lg p-4">
                  <div className="flex justify-between text-xs text-status-blue font-display font-medium mb-3">
                    <span className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 bg-status-blue rounded-full animate-pulse"></span>
                      Fetching Logs
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

            {/* SWR Engine Terminal Window */}
            <div className="bg-brand-terminal rounded-lg border border-[#333] w-[90%] ml-auto shadow-[0_25px_50px_-12px_rgba(0,0,0,0.5)] font-mono overflow-hidden -mt-8 relative z-10">
              <div className="h-8 bg-brand-panel border-b border-[#333] flex items-center px-4">
                <div className="flex gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-[#FF5F56]"></div>
                  <div className="w-2.5 h-2.5 rounded-full bg-[#FFBD2E]"></div>
                  <div className="w-2.5 h-2.5 rounded-full bg-[#27C93F]"></div>
                </div>
                <div className="grow text-center text-xs text-text-dim mr-[46px]">
                  Next.js Server Logs
                </div>
              </div>
              <div className="p-6 text-text-muted text-[13px] leading-relaxed">
                <div className="mb-1">
                  <span className="text-text-dim mr-2">SWR</span> Mount detected, reading <span className="text-brand-orange">IndexedDB...</span>
                </div>
                <div className="mb-1">
                  <span className="text-text-dim mr-2">SWR</span> Cache loaded: <span className="text-status-green">Painted in 0ms</span>
                </div>
                <div className="mb-1">
                  <span className="text-text-dim mr-2">MUTEX</span> Locks acquired for 12 repositories.
                </div>
                <div className="mb-1">
                  <span className="text-text-dim mr-2">NET</span> Executing <span className="text-status-blue">800ms cascade delay...</span>
                </div>
                <div className="mb-1">
                  <span className="text-text-dim mr-2">API</span> Hash Mismatch: <span className="text-white">a3f91c2</span> != cached.
                </div>
                <div className="mb-1">
                  <span className="text-text-dim mr-2">API</span> Extracted test logs <span className="text-status-green">✓ 80/100</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Feature Highlights Group */}
        <section id="architecture" className="flex flex-col gap-12 mt-8">
          <div className="flex flex-col gap-4">
            <p className="label-micro">ENGINE ARCHITECTURE</p>
            <div className="flex flex-col md:flex-row justify-between md:items-end gap-6">
              <h2 className="text-[3rem] leading-[1.1] font-display tracking-tight">
                Designed for speed. <br />
                <span className="text-gradient">Built for defense.</span>
              </h2>
              <p className="text-text-muted max-w-[400px] text-base leading-relaxed">
                Checking 15+ private repositories continuously will trigger a GitHub API ban. This tool navigates the cost matrix so you don't have to.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="glass-card">
              <div className="flex justify-between items-start mb-6">
                <div className="bg-white/5 font-mono text-xs px-2 py-1 rounded text-text-muted">01</div>
                <div className="w-2 h-2 rounded-full bg-brand-orange shadow-[0_0_8px_#FF5B14]"></div>
              </div>
              <h3 className="text-xl font-display text-white mb-3">SWR State Machine</h3>
              <p className="text-[14px] text-text-muted leading-relaxed">
                The polling engine verifies 7-character commit hashes before spending API points on heavy fetches, enforcing strict 45-minute cooldowns to preserve quotas.
              </p>
            </div>

            <div className="glass-card">
              <div className="flex justify-between items-start mb-6">
                <div className="bg-white/5 font-mono text-xs px-2 py-1 rounded text-text-muted">02</div>
                <div className="w-2 h-2 rounded-full bg-status-blue shadow-[0_0_8px_#3498DB]"></div>
              </div>
              <h3 className="text-xl font-display text-white mb-3">Thundering Herd Defenses</h3>
              <p className="text-[14px] text-text-muted leading-relaxed">
                Concurrency mutex locks, debounce engines, and 800ms cascade delays prevent rate-limit bans when your dashboard attempts to fetch dozens of repos simultaneously.
              </p>
            </div>

            <div className="glass-card">
              <div className="flex justify-between items-start mb-6">
                <div className="bg-white/5 font-mono text-xs px-2 py-1 rounded text-text-muted">03</div>
                <div className="w-2 h-2 rounded-full bg-status-green shadow-[0_0_8px_#2ECC71]"></div>
              </div>
              <h3 className="text-xl font-display text-white mb-3">Offline-First IndexedDB</h3>
              <p className="text-[14px] text-text-muted leading-relaxed">
                Zero-latency UI. Browser caching guarantees your historical scores paint instantly on mount, preserving your state even if GitHub's servers throw a 404.
              </p>
            </div>
          </div>
        </section>

        {/* CTA Banner */}
        <section className="relative bg-brand-panel border border-ui-border-light rounded-2xl p-16 flex flex-col md:flex-row justify-between items-center overflow-hidden gap-8">
          <div className="absolute top-0 right-0 w-1/2 h-full bg-[radial-gradient(circle_at_80%_50%,_rgba(255,91,20,0.15)_0%,_rgba(0,0,0,0)_70%)] pointer-events-none"></div>

          <div className="z-10 w-full flex flex-col md:flex-row justify-between items-center gap-8">
            <div>
              <h2 className="text-[2.5rem] leading-[1.1] font-display tracking-tight mb-4">
                Ship code. The SWR engine <br />
                <span className="text-gradient">handles the rest.</span>
              </h2>
              <p className="text-sm text-text-muted">
                Free for developers · Read-only scopes · Server-side parsing
              </p>
            </div>
            <Link href="/connect" className="btn-primary shrink-0">
              Connect GitHub App
            </Link>
          </div>
        </section>

      </main>

      {/* Footer */}
      <footer className="w-full max-w-[1200px] px-6 py-12 flex flex-col md:flex-row justify-between items-center gap-4 border-t border-ui-border-light text-text-dim text-xs font-mono mt-16">
        <p>© 2026 Telemetry.dev · MIT License</p>
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-ui-border-light text-white">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path><path d="M2 12h20"></path></svg>
          Made with Emergent
        </div>
      </footer>
    </div>
  );
}