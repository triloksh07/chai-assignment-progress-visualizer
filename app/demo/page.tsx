import React from 'react';

const mockAssignments = [
  {
    id: 1,
    status: 'success',
    course: 'BACKEND INFRA',
    title: 'auth-api',
    commit: '78ad4f8',
    statusPill: 'Completed',
    score: 100,
    tests: '6 / 6',
    time: 'Cached',
    percent: 100
  },
  {
    id: 2,
    status: 'fetching',
    course: 'JAVASCRIPT FOUNDATIONS',
    title: 'js-async-oops',
    commit: 'df6cd85',
    statusPill: 'In-progress',
    score: 38,
    tests: '? / 12',
    time: 'Running Cascade...',
    percent: 38
  },
  {
    id: 3,
    status: 'error',
    course: 'BACKEND INFRA',
    title: 'image-upload-api',
    commit: '8d2dad9',
    statusPill: 'Pending',
    score: 0,
    tests: '0 / 6',
    time: 'Cached',
    percent: 0
  },
  {
    id: 4,
    status: 'success',
    course: 'JAVASCRIPT FOUNDATIONS',
    title: 'js-datatypes',
    commit: '70c3832',
    statusPill: 'Completed',
    score: 100,
    tests: '12 / 12',
    time: 'Cached',
    percent: 100
  },
  {
    id: 5,
    status: 'error',
    course: 'JAVASCRIPT FOUNDATIONS',
    title: 'js-dom',
    commit: 'f32726a',
    statusPill: 'Pending',
    score: 0,
    tests: '0 / 12',
    time: 'Offline (Stale)',
    percent: 0
  },
  {
    id: 6,
    status: 'success',
    course: 'BACKEND INFRA',
    title: 'first-crud-app',
    commit: 'b0f001a',
    statusPill: 'Completed',
    score: 100,
    tests: '5 / 5',
    time: 'Cached',
    percent: 100
  }
];

export default function DemoDashboardPage() {
  return (
    <div className="relative flex flex-col min-h-screen bg-brand-dark text-text-primary font-sans overflow-x-hidden">

      <main className="page-container w-full max-w-7xl mx-auto">
        <div className="w-full flex flex-col gap-8">

          {/* Control Room Header */}
          <div className="flex flex-col md:flex-row justify-between md:items-end gap-6 mb-2">
            <div className="flex flex-col gap-2">
              <div className="label-micro">CONTROL ROOM</div>
              <h1 className="font-display text-[2.5rem] font-extrabold leading-[1.1] tracking-tight text-white">
                Tracking <span className="text-gradient"> {mockAssignments.length} Repositories</span>
              </h1>
              <div className="font-mono text-[13px] text-text-muted mt-1">
                You are viewing a static demonstration of the SWR polling engine.
              </div>
            </div>
          </div>

          {/* Assignments Grid (Mapped from mock data) */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {mockAssignments.map((repo) => (
              <DemoAssignmentCard key={repo.id} repo={repo} />
            ))}
          </div>
        </div>

        {/* Engine Anatomy Section */}
        <div className="mt-16 pt-16 border-t border-ui-border flex flex-col gap-8">
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
        </div>
      </main>
    </div>
  );
}

// 🧱 STATIC COMPONENT: DEMO ASSIGNMENT CARD
function DemoAssignmentCard({ repo }: { repo: any }) {
  // Premium Tailwind Mapping (Identical to real dashboard)
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
      scoreText: 'text-text-dim'
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

  const current = stateMap[repo.status as keyof typeof stateMap];

  return (
    <div className={`glass-card flex flex-col p-0 transition-all duration-300 ${current.card}`}>
      <div className="p-6 pb-4 flex flex-col gap-4 relative">
        <div className="flex flex-col gap-1 pr-20">
          <div className="label-micro truncate">{repo.course}</div>
          <h3 className="font-display text-xl font-bold text-white truncate">{repo.title}</h3>
        </div>

        <div className="flex justify-between items-end mt-2">
          <div className="flex flex-col">
            <div className="label-micro mb-1">SCORE</div>
            <div className={`font-display text-3xl font-bold leading-none ${current.scoreText}`}>
              {repo.score} <span className="text-base text-text-dim font-sans font-medium">/ 100</span>
            </div>
          </div>

          <div className="flex flex-col items-end gap-1">
            <span className="font-mono text-[11px] text-text-muted bg-white/5 px-2 py-0.5 rounded border border-ui-border-light">
              {repo.commit}
            </span>
          </div>
        </div>

        <div className="w-full h-1.5 bg-black/40 rounded-full overflow-hidden mt-2 border border-white/5">
          <div className={`h-full rounded-full transition-all duration-1000 ${current.bar}`} style={{ width: `${repo.percent}%` }}></div>
        </div>
      </div>

      <div className="bg-black/20 border-t border-ui-border-light px-6 py-3 flex justify-between items-center mt-auto">
        <div className="flex gap-4 items-center">
          <span className={`whitespace-nowrap text-[10px] px-2 py-0.5 rounded font-bold border ${current.pill}`}>
            {repo.statusPill}
          </span>
          <span className="text-[11px] font-mono text-text-dim">{repo.time}</span>
        </div>
      </div>
    </div>
  );
}


// ============================================================================
// 🧱 COMPONENT: STATIC ANATOMY CARD (For Documentation Section)
// ============================================================================
function AnatomyCard({ status, title, desc }: { status: 'stale' | 'fetching' | 'success' | 'error', title: string, desc: string }) {
  const stateMap = {
    stale: { card: 'border-ui-border-light', bar: 'bg-text-dim' },
    fetching: { card: 'border-status-blue/30 shadow-[0_0_20px_rgba(52,152,219,0.05)]', bar: 'bg-status-blue' },
    success: { card: 'border-status-green/30 shadow-[0_0_20px_rgba(46,204,113,0.05)]', bar: 'bg-status-green' },
    error: { card: 'border-brand-orange/40 shadow-[0_0_20px_rgba(255,91,20,0.05)]', bar: 'bg-brand-orange' }
  };
  const current = stateMap[status];

  return (
    <div className={`glass-card flex flex-col p-6 gap-4 transition-all duration-300 ${current.card} !transform-none hover:!translate-y-0 cursor-default`}>
      <h3 className="font-display text-lg font-bold text-white">{title}</h3>
      <div className="w-full h-1 bg-white/10 rounded-full overflow-hidden">
        <div className={`h-full rounded-full ${current.bar}`} style={{ width: status === 'fetching' ? '40%' : '100%' }}></div>
      </div>
      <p className="text-[13px] text-text-muted leading-relaxed">{desc}</p>
    </div>
  );
}