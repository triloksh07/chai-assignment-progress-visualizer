import Link from 'next/link';
import React from 'react';

export default function MainDashboardPage() {
  return (
    <div className="relative flex flex-col min-h-screen bg-brand-dark text-text-primary font-sans overflow-x-hidden">

      {/* App Header */}
      <header className="app-header">
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <div className="flex">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect width="24" height="24" rx="4" fill="#FF5B14" />
              </svg>
            </div>
            <div className="flex flex-col">
              <span className="font-display font-bold text-base leading-none tracking-tight">Telemetry.dev</span>
              <span className="text-[0.55rem] text-text-muted font-semibold tracking-widest mt-0.5 uppercase">CLASSROOM POLLING ENGINE</span>
            </div>
          </div>
        </div>

        <nav className="flex h-full">
          <Link href="/main-dashboard" className="h-16 px-4 flex items-center text-text-primary text-[13px] font-medium relative after:content-[''] after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-brand-orange">Dashboard</Link>
          <Link href="/assignment" className="h-16 px-4 flex items-center text-text-muted text-[13px] font-medium transition-colors hover:text-text-primary">Assignment</Link>
          <Link href="/" className="h-16 px-4 flex items-center text-text-muted text-[13px] font-medium transition-colors hover:text-text-primary">Settings</Link>
        </nav>

        <div className="flex-1 flex justify-end items-center gap-4">
          <div className="flex items-center gap-2 font-mono text-xs text-text-muted">
            <div className="w-1.5 h-1.5 rounded-full bg-status-green shadow-[0_0_8px_#2ECC71]"></div>
            polling • 30s
          </div>
          <button className="bg-transparent border border-ui-border-light rounded-md w-8 h-8 flex items-center justify-center text-text-muted cursor-pointer transition-colors hover:bg-ui-card hover:text-text-primary">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>
          </button>
          <div className="flex items-center gap-2 px-3 h-8 rounded-md border border-ui-border-light bg-ui-card text-[13px] text-text-primary font-medium cursor-pointer transition-colors hover:border-ui-border">
            octocat
          </div>
        </div>
      </header>

      <main className="page-container">
        <div className="content-wrapper">

          {/* Control Room Header */}
          <div className="flex flex-col md:flex-row justify-between md:items-end gap-6 mb-2">
            <div className="flex flex-col gap-2">
              <div className="label-micro">CONTROL ROOM</div>
              <h1 className="font-display text-[2.5rem] font-extrabold leading-[1.1] tracking-tight text-white">
                Hey Octocat, <span className="text-gradient">3 runs</span> changed since lunch.
              </h1>
              <div className="font-mono text-[13px] text-text-muted mt-1">
                Last sweep · 12 seconds ago · next sweep in 00:18 · polling=30s
              </div>
            </div>
            <div className="flex gap-4 shrink-0">
              <button className="flex items-center gap-2 px-4 py-2 bg-transparent border border-ui-border text-text-primary rounded-md font-semibold text-sm transition-colors hover:border-text-dim cursor-pointer">
                Force poll
              </button>
              <button className="flex items-center gap-2 px-4 py-2 bg-brand-orange text-white rounded-md font-semibold text-sm shadow-[0_4px_12px_rgba(255,91,20,0.3)] transition-all hover:brightness-110 hover:-translate-y-px cursor-pointer">
                + Add classroom repo
              </button>
            </div>
          </div>

          {/* Top Stat Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="glass-card !transform-none hover:!translate-y-0 flex items-center gap-6 py-6 px-6 cursor-default">
              <div className="w-20 h-20 rounded-full flex items-center justify-center relative shrink-0" style={{ background: `conic-gradient(#FF5B14 19%, rgba(255,255,255,0.05) 0)` }}>
                <div className="absolute inset-2 rounded-full bg-[#111113]"></div>
                <div className="relative z-10 font-display font-bold text-xl text-white">19%</div>
              </div>
              <div className="flex flex-col">
                <div className="label-micro mb-1">QUEUED</div>
                <div className="font-display text-[2rem] font-bold leading-none text-white mb-1">3 <span className="text-base text-text-dim font-medium font-sans">/ 16</span></div>
                <div className="text-[13px] text-text-muted">13 remaining</div>
              </div>
            </div>

            <div className="glass-card !transform-none hover:!translate-y-0 flex items-center gap-6 py-6 px-6 cursor-default">
              <div className="w-20 h-20 rounded-full flex items-center justify-center relative shrink-0" style={{ background: `conic-gradient(#3498DB 6%, rgba(255,255,255,0.05) 0)` }}>
                <div className="absolute inset-2 rounded-full bg-[#111113]"></div>
                <div className="relative z-10 font-display font-bold text-xl text-white">6%</div>
              </div>
              <div className="flex flex-col">
                <div className="label-micro mb-1">IN-PROGRESS</div>
                <div className="font-display text-[2rem] font-bold leading-none text-white mb-1">1 <span className="text-base text-text-dim font-medium font-sans">/ 16</span></div>
                <div className="text-[13px] text-text-muted">15 remaining</div>
              </div>
            </div>

            <div className="glass-card !transform-none hover:!translate-y-0 flex items-center gap-6 py-6 px-6 cursor-default">
              <div className="w-20 h-20 rounded-full flex items-center justify-center relative shrink-0" style={{ background: `conic-gradient(#2ECC71 75%, rgba(255,255,255,0.05) 0)` }}>
                <div className="absolute inset-2 rounded-full bg-[#111113]"></div>
                <div className="relative z-10 font-display font-bold text-xl text-white">75%</div>
              </div>
              <div className="flex flex-col">
                <div className="label-micro mb-1">COMPLETED</div>
                <div className="font-display text-[2rem] font-bold leading-none text-white mb-1">12 <span className="text-base text-text-dim font-medium font-sans">/ 16</span></div>
                <div className="text-[13px] text-text-muted">4 remaining</div>
              </div>
            </div>
          </div>

          {/* Live Log Banner */}
          <div className="live-banner">
            <div className="flex items-center gap-2 text-status-blue font-semibold tracking-widest border-r border-ui-border pr-4 shrink-0">
              <div className="w-2 h-2 bg-status-blue rounded-full shadow-[0_0_8px_#3498DB] animate-pulse"></div>
              LIVE
            </div>
            <div className="text-text-muted animate-ticker whitespace-nowrap min-w-full">
              <span className="text-text-dim">14:02:11</span> <span className="text-status-blue font-bold">[fetch]</span> cs142-lab07 · extracting artifacts · 1.2MB ·&nbsp;&nbsp;&nbsp;
              <span className="text-text-dim">14:01:40</span> <span className="text-status-green font-bold">[pass]</span> cs231-proj2 · 18/18 ·&nbsp;&nbsp;&nbsp;
              <span className="text-text-dim">14:01:02</span> <span className="text-brand-orange font-bold">[warn]</span> cs305-hw02 · rate-limit (resets 14:10)
            </div>
          </div>

          {/* Filters Row */}
          <div className="flex flex-col md:flex-row justify-between md:items-center mt-4 gap-4">
            <div className="flex flex-wrap gap-3">
              <div className="filter-pill filter-pill-active">All <span className="bg-black/10 rounded px-1.5 font-mono text-[11px]">6</span></div>
              <div className="filter-pill">Cached <span className="bg-white/10 rounded px-1.5 font-mono text-[11px]">2</span></div>
              <div className="filter-pill" style={{ borderColor: 'rgba(52, 152, 219, 0.3)' }}>Fetching <span className="bg-white/10 rounded px-1.5 font-mono text-[11px]">1</span></div>
              <div className="filter-pill" style={{ borderColor: 'rgba(46, 204, 113, 0.3)' }}>Success <span className="bg-white/10 rounded px-1.5 font-mono text-[11px]">2</span></div>
              <div className="filter-pill" style={{ borderColor: 'rgba(255, 91, 20, 0.3)' }}>Errors <span className="bg-white/10 rounded px-1.5 font-mono text-[11px]">1</span></div>
            </div>
            <div className="relative w-full md:w-auto">
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 text-text-dim w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
              <input type="text" className="w-full md:w-[300px] bg-ui-card border border-ui-border rounded-md py-2 pl-9 pr-4 text-white text-sm outline-none transition-colors focus:border-text-muted" placeholder="Search title, course, commit hash..." />
            </div>
          </div>

          {/* Assignments Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <AssignmentCard status="success" course="CS 101 · DATA STRUCTURES" title="Binary Search Trees" commit="a3f91c2" file="autograde.yml" statusPill="Synced · all tests passed" score={100} tests="8 / 10" time="12 min ago" />
            <AssignmentCard status="fetching" course="CS 142 · SYSTEMS" title="Concurrent Hash Maps" commit="7b2e40d" file="classroom.yml" statusPill="Fetching AWS Logs..." score={62} tests="? / 14" time="polling now" />
            <AssignmentCard status="success" course="CS 231 · ALGORITHMS" title="Huffman Compression" commit="e10d5af" file="grade.yml" statusPill="Synced · all tests passed" score={94} tests="18 / 18" time="just synced" />
            <AssignmentCard status="error" course="CS 305 · NETWORKS" title="HTTP Request Parser" commit="9c44b10" file="test.yml" statusPill="Rate Limit Exceeded · 403" score={72} tests="? / 12" time="3 min ago" />
            <AssignmentCard status="stale" course="CS 410 · COMPILERS" title="Lexer & Token Stream" commit="5d88c7b" file="autograde.yml" statusPill="Cached · awaiting poll" score={88} tests="22 / 25" time="1 hr ago" />
            <AssignmentCard status="success" course="CS 188 · AI" title="Pac-Man Multi-Agent" commit="2f6ac01" file="classroom.yml" statusPill="Synced · all tests passed" score={54} tests="9 / 16" time="just synced" />
          </div>

          {/* Anatomy Section */}
          <div className="mt-16 pt-16 border-t border-ui-border flex flex-col gap-8">
            <div className="text-left">
              <div className="label-micro mb-2">CARD STATE ANATOMY</div>
              <h2 className="font-display text-[2rem] font-bold tracking-tight text-white mb-2">The four phases of a poll.</h2>
              <p className="text-[14px] text-text-muted">Each card is engineered so peripheral vision alone can tell you what changed.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <AssignmentCard isAnatomy status="stale" course="CS 101 · DATA STRUCTURES" title="Binary Search Trees" commit="a3f91c2" file="autograde.yml" statusPill="Cached · awaiting poll" score={80} tests="8 / 10" time="12 min ago" />
              <AssignmentCard isAnatomy status="fetching" course="CS 142 · SYSTEMS" title="Concurrent Hash Maps" commit="7b2e40d" file="classroom.yml" statusPill="Fetching AWS Logs..." score={62} tests="? / 14" time="polling now" />
              <AssignmentCard isAnatomy status="success" course="CS 231 · ALGORITHMS" title="Huffman Compression" commit="e10d5af" file="grade.yml" statusPill="Synced · all tests passed" score={94} tests="18 / 18" time="just synced" />
              <AssignmentCard isAnatomy status="error" course="CS 305 · NETWORKS" title="HTTP Request Parser" commit="9c44b10" file="test.yml" statusPill="Rate Limit Exceeded · 403" score={72} tests="? / 12" time="3 min ago" />
            </div>
          </div>
        </div>
      </main>

      <footer className="w-full flex justify-between px-6 py-8 border-t border-ui-border font-mono text-[13px] text-text-dim mt-auto">
        <div>telemetry.dev · v2.4.1 · polling-engine healthy</div>
        <div className="cursor-pointer hover:text-text-muted transition-colors">manage connections →</div>
      </footer>
    </div>
  );
}

// AssignmentCard component strictly driven by the SWR Design Spec mapping
function AssignmentCard({ status, course, title, commit, file, statusPill, score, tests, time, isAnatomy }: any) {
  // Map engine state to exact tailwind utility strings
  const stateMap = {
    stale: {
      card: 'border-ui-border-light',
      pill: 'text-text-muted bg-white/5 border-white/10',
      dot: 'bg-text-dim',
      bar: 'bg-text-dim',
    },
    fetching: {
      card: 'border-status-blue/30 shadow-[0_0_20px_rgba(52,152,219,0.05)]',
      pill: 'text-status-blue bg-status-blue/10 border-status-blue/20',
      dot: 'bg-status-blue animate-pulse',
      bar: 'bg-status-blue',
    },
    success: {
      card: 'border-status-green/30 shadow-[0_0_20px_rgba(46,204,113,0.05)]',
      pill: 'text-status-green bg-status-green/10 border-status-green/20',
      dot: 'bg-status-green',
      bar: 'bg-status-green',
    },
    error: {
      card: 'border-brand-red/40 shadow-[0_0_20px_rgba(255,43,79,0.05)]',
      pill: 'text-brand-orange bg-brand-orange/10 border-brand-orange/20',
      dot: 'bg-brand-orange',
      bar: 'bg-brand-red',
    }
  };

  const current = stateMap[status as keyof typeof stateMap];
  const pointerClass = isAnatomy ? '!transform-none hover:!translate-y-0 cursor-default' : 'cursor-pointer';

  return (
    <div className={`glass-card flex flex-col justify-between gap-4 ${current.card} ${pointerClass}`}>

      <div className="flex flex-col gap-2">
        <div className="flex justify-between items-center">
          <div className="label-micro truncate max-w-[80%]">{course}</div>
          <div className="text-text-dim text-[15px]">↗</div>
        </div>
        <h3 className="font-display text-[1.25rem] font-bold leading-[1.2] text-white">{title}</h3>
      </div>

      <div className="flex items-center flex-wrap gap-2 font-mono text-[11px] text-text-muted">
        <span className="text-white">{commit}</span> · <span>{file}</span>
        <span className={`ml-auto px-2 py-0.5 rounded border ${current.pill}`}>{statusPill}</span>
      </div>

      <div className="flex justify-between items-end mt-2">
        <div className="flex flex-col">
          <div className="label-micro mb-1">{status === 'error' && !isAnatomy ? 'LAST KNOWN SCORE' : 'SCORE'}</div>
          <div className={`font-display text-[2rem] font-bold leading-none ${status === 'fetching' || status === 'error' && isAnatomy ? 'text-text-dim' : 'text-white'}`}>
            {score} <span className="text-[15px] font-sans font-medium text-text-dim">{score !== '?' ? '/ 100' : ''}</span>
          </div>
        </div>
        <div className="flex flex-col text-right">
          <div className="label-micro mb-1">TESTS</div>
          <div className={`font-display text-base font-bold ${status === 'fetching' || status === 'error' ? 'text-text-dim' : 'text-white'}`}>{tests}</div>
        </div>
      </div>

      <div className="w-full h-1 bg-white/10 rounded-full overflow-hidden my-1">
        <div className={`h-full rounded-full ${current.bar}`} style={{ width: `${score === '?' ? 0 : score}%` }}></div>
      </div>

      <div className="flex justify-between items-center font-mono text-[11px] text-text-muted mt-1">
        <div>{time}</div>
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${current.dot}`}></div>
          <span className="capitalize">{status}</span>
        </div>
      </div>
    </div>
  );
}