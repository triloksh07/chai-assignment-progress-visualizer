import Link from 'next/link';

export default function AssignmentPage() {
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
        
        <nav className="flex h-full">
          <Link href="/dashboard" className="h-16 px-4 flex items-center text-text-muted text-[13px] font-medium transition-colors hover:text-text-primary">Dashboard</Link>
          <Link href="/assignments" className="h-16 px-4 flex items-center text-text-primary text-[13px] font-medium relative after:content-[''] after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-brand-orange">Assignment</Link>
          <Link href="/settings" className="h-16 px-4 flex items-center text-text-muted text-[13px] font-medium transition-colors hover:text-text-primary">Settings</Link>
        </nav>
        
        <div className="flex-1 flex justify-end items-center gap-4">
          <div className="flex items-center gap-2 font-mono text-xs text-text-muted">
            <div className="w-1.5 h-1.5 rounded-full bg-status-green shadow-[0_0_8px_#2ECC71]"></div>
            polling • 30s
          </div>
          <button className="bg-transparent border border-ui-border-light rounded-md w-8 h-8 flex items-center justify-center text-text-muted cursor-pointer transition-colors hover:bg-ui-card hover:text-text-primary">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>
          </button>
          <div className="flex items-center gap-2 px-3 h-8 rounded-md border border-ui-border-light bg-ui-card text-[13px] text-text-primary font-medium cursor-pointer transition-colors hover:border-ui-border">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"></path></svg>
            octocat
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="page-container">
        {/* We override the max-w to 960px for this specific detail page to maintain reading measure */}
        <div className="w-full max-w-[960px] flex flex-col">
          
          {/* Back Navigation */}
          <Link href="/dashboard" className="inline-flex items-center gap-2 text-text-muted text-[13px] font-medium mb-10 transition-colors hover:text-text-primary w-fit">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>
            Back to control room
          </Link>

          {/* Assignment Header Summary */}
          <div className="flex flex-col md:flex-row justify-between items-start mb-12 gap-6">
            <div className="flex flex-col">
              <div className="label-micro mb-3">CS 231 • ALGORITHMS</div>
              <h1 className="font-display text-[3rem] font-bold leading-[1.1] text-white mb-4 tracking-tight">Huffman Compression</h1>
              
              <div className="flex flex-wrap items-center gap-3 text-text-muted text-[13px] font-mono">
                <span className="flex items-center gap-2">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="18" cy="18" r="3"></circle><circle cx="6" cy="6" r="3"></circle><path d="M13 6h3a2 2 0 0 1 2 2v7"></path><line x1="6" y1="9" x2="6" y2="21"></line></svg>
                  e10d5af
                </span>
                <span className="text-text-dim">•</span>
                <span>grade.yml</span>
                <span className="text-text-dim">•</span>
                <span className="flex items-center gap-2">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
                  synced just now
                </span>
              </div>
            </div>

            <div className="glass-card flex py-6 px-8 gap-8 m-0 !transform-none hover:!translate-y-0 cursor-default">
              <div className="flex flex-col">
                <div className="label-micro mb-2">SCORE</div>
                <div className="flex items-baseline gap-1">
                  <span className="font-display text-[2.5rem] font-bold text-brand-orange leading-none">94</span>
                  <span className="text-sm text-text-dim">/100</span>
                </div>
              </div>
              <div className="w-px bg-ui-border"></div>
              <div className="flex flex-col">
                <div className="label-micro mb-2">TESTS</div>
                <div className="font-display text-2xl font-bold text-white leading-none mb-1">6/8</div>
                <div className="text-xs text-text-muted">2 failing</div>
              </div>
            </div>
          </div>

          {/* Stat Cards Row */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            {/* Workflow Runtime */}
            <div className="glass-card py-5 px-6 flex items-start gap-4 !transform-none hover:!translate-y-0 cursor-default">
              <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-text-muted shrink-0">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><polyline points="21 15 16 10 5 21"></polyline></svg>
              </div>
              <div className="flex flex-col gap-2">
                <div className="label-micro">WORKFLOW RUNTIME</div>
                <div className="text-[14px] font-medium text-white font-mono">1m 47s</div>
              </div>
            </div>

            {/* Artifacts */}
            <div className="glass-card py-5 px-6 flex items-start gap-4 !transform-none hover:!translate-y-0 cursor-default">
              <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-text-muted shrink-0">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
              </div>
              <div className="flex flex-col gap-2">
                <div className="label-micro">ARTIFACTS</div>
                <div className="text-[14px] font-medium text-white font-mono">3 files • 4.1MB</div>
              </div>
            </div>

            {/* Run URL */}
            <div className="glass-card py-5 px-6 flex items-start gap-4 !transform-none hover:!translate-y-0 cursor-default">
              <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-text-muted shrink-0">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path><polyline points="15 3 21 3 21 9"></polyline><line x1="10" y1="14" x2="21" y2="3"></line></svg>
              </div>
              <div className="flex flex-col gap-2">
                <div className="label-micro">RUN URL</div>
                <Link href="#" className="text-[14px] font-medium text-text-muted font-mono underline decoration-dotted transition-colors hover:text-white">github.com/run/4182</Link>
              </div>
            </div>
          </div>

          {/* Test Runs Section */}
          <div className="bg-ui-card border border-ui-border rounded-xl overflow-hidden">
            <div className="p-6 md:px-8 border-b border-ui-border flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
              <div className="flex flex-col">
                <div className="label-micro">AUTOGRADE.LOG</div>
                <h2 className="font-display text-2xl font-bold text-white leading-none mt-2">Test runs</h2>
              </div>
              <div className="flex gap-3">
                <button className="bg-transparent border border-ui-border-light rounded-md px-3 py-2 flex items-center gap-2 text-text-muted text-xs font-medium cursor-pointer transition-colors hover:border-ui-border hover:text-white">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
                  raw log
                </button>
                <button className="bg-transparent border border-ui-border-light rounded-md px-3 py-2 flex items-center gap-2 text-text-muted text-xs font-medium cursor-pointer transition-colors hover:border-ui-border hover:text-white">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path><polyline points="15 3 21 3 21 9"></polyline><line x1="10" y1="14" x2="21" y2="3"></line></svg>
                  view on GitHub
                </button>
              </div>
            </div>

            <div className="flex flex-col">
              {/* Row 1 */}
              <div className="grid grid-cols-[auto_1fr_auto] md:grid-cols-[2fr_1fr_auto] py-4 px-6 md:px-8 border-b border-ui-border-light items-center font-mono text-[13px] gap-4 last:border-none">
                <div className="flex items-center gap-3 col-span-2 md:col-span-1">
                  <div className="text-status-green flex items-center justify-center w-4 h-4 rounded-full border border-status-green/30 p-0.5 shrink-0">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                  </div>
                  <span className="text-white truncate">test_insert_root</span>
                </div>
                <div className="hidden md:block text-brand-orange text-right pr-8 truncate"></div>
                <div className="text-right text-text-muted shrink-0">12ms</div>
              </div>

              {/* Row 2 */}
              <div className="grid grid-cols-[auto_1fr_auto] md:grid-cols-[2fr_1fr_auto] py-4 px-6 md:px-8 border-b border-ui-border-light items-center font-mono text-[13px] gap-4 last:border-none">
                <div className="flex items-center gap-3 col-span-2 md:col-span-1">
                  <div className="text-status-green flex items-center justify-center w-4 h-4 rounded-full border border-status-green/30 p-0.5 shrink-0">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                  </div>
                  <span className="text-white truncate">test_balance_after_delete</span>
                </div>
                <div className="hidden md:block text-brand-orange text-right pr-8 truncate"></div>
                <div className="text-right text-text-muted shrink-0">41ms</div>
              </div>

              {/* Row 3 */}
              <div className="grid grid-cols-[auto_1fr_auto] md:grid-cols-[2fr_1fr_auto] py-4 px-6 md:px-8 border-b border-ui-border-light items-center font-mono text-[13px] gap-4 last:border-none">
                <div className="flex items-center gap-3 col-span-2 md:col-span-1">
                  <div className="text-status-green flex items-center justify-center w-4 h-4 rounded-full border border-status-green/30 p-0.5 shrink-0">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                  </div>
                  <span className="text-white truncate">test_iterator_inorder</span>
                </div>
                <div className="hidden md:block text-brand-orange text-right pr-8 truncate"></div>
                <div className="text-right text-text-muted shrink-0">18ms</div>
              </div>

              {/* Row 4 - Failed */}
              <div className="grid grid-cols-[1fr_auto] md:grid-cols-[2fr_1fr_auto] py-4 px-6 md:px-8 border-b border-ui-border-light items-center font-mono text-[13px] gap-y-2 md:gap-4 last:border-none bg-brand-orange/5">
                <div className="flex items-center gap-3 col-span-2 md:col-span-1">
                  <div className="text-brand-orange flex items-center justify-center w-4 h-4 rounded-full border border-brand-orange/30 p-0.5 shrink-0">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                  </div>
                  <span className="text-white truncate">test_height_invariant</span>
                </div>
                <div className="text-brand-orange md:text-right md:pr-8 truncate col-span-1 md:col-span-1 ml-7 md:ml-0">
                  expected 4, got 5
                </div>
                <div className="text-right text-text-muted shrink-0 col-span-1 md:col-span-1">—</div>
              </div>

              {/* Row 5 */}
              <div className="grid grid-cols-[auto_1fr_auto] md:grid-cols-[2fr_1fr_auto] py-4 px-6 md:px-8 border-b border-ui-border-light items-center font-mono text-[13px] gap-4 last:border-none">
                <div className="flex items-center gap-3 col-span-2 md:col-span-1">
                  <div className="text-status-green flex items-center justify-center w-4 h-4 rounded-full border border-status-green/30 p-0.5 shrink-0">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                  </div>
                  <span className="text-white truncate">test_rotation_left_right</span>
                </div>
                <div className="hidden md:block text-brand-orange text-right pr-8 truncate"></div>
                <div className="text-right text-text-muted shrink-0">33ms</div>
              </div>

              {/* Row 6 */}
              <div className="grid grid-cols-[auto_1fr_auto] md:grid-cols-[2fr_1fr_auto] py-4 px-6 md:px-8 border-b border-ui-border-light items-center font-mono text-[13px] gap-4 last:border-none">
                <div className="flex items-center gap-3 col-span-2 md:col-span-1">
                  <div className="text-status-green flex items-center justify-center w-4 h-4 rounded-full border border-status-green/30 p-0.5 shrink-0">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                  </div>
                  <span className="text-white truncate">test_bulk_load_100k</span>
                </div>
                <div className="hidden md:block text-brand-orange text-right pr-8 truncate"></div>
                <div className="text-right text-text-muted shrink-0">1.2s</div>
              </div>

              {/* Row 7 - Failed */}
              <div className="grid grid-cols-[1fr_auto] md:grid-cols-[2fr_1fr_auto] py-4 px-6 md:px-8 border-b border-ui-border-light items-center font-mono text-[13px] gap-y-2 md:gap-4 last:border-none bg-brand-orange/5">
                <div className="flex items-center gap-3 col-span-2 md:col-span-1">
                  <div className="text-brand-orange flex items-center justify-center w-4 h-4 rounded-full border border-brand-orange/30 p-0.5 shrink-0">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                  </div>
                  <span className="text-white truncate">test_delete_non_existent</span>
                </div>
                <div className="text-brand-orange md:text-right md:pr-8 truncate col-span-1 md:col-span-1 ml-7 md:ml-0">
                  NullPointerException at line 142
                </div>
                <div className="text-right text-text-muted shrink-0 col-span-1 md:col-span-1">—</div>
              </div>

              {/* Row 8 */}
              <div className="grid grid-cols-[auto_1fr_auto] md:grid-cols-[2fr_1fr_auto] py-4 px-6 md:px-8 border-b border-ui-border-light items-center font-mono text-[13px] gap-4 last:border-none">
                <div className="flex items-center gap-3 col-span-2 md:col-span-1">
                  <div className="text-status-green flex items-center justify-center w-4 h-4 rounded-full border border-status-green/30 p-0.5 shrink-0">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                  </div>
                  <span className="text-white truncate">test_serialize_roundtrip</span>
                </div>
                <div className="hidden md:block text-brand-orange text-right pr-8 truncate"></div>
                <div className="text-right text-text-muted shrink-0">27ms</div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Sticky Badge */}
      <div className="fixed bottom-6 right-6 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-black border border-ui-border text-white text-xs font-display font-medium z-50">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path><path d="M2 12h20"></path></svg>
        Made with Emergent
      </div>
    </div>
  );
}