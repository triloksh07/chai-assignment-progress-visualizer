'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { useEffect, useState, Suspense } from 'react';
import { useAssignmentSync } from '@/hooks/useAssignmentSync';

function AssignmentContent() {
  const searchParams = useSearchParams();
  const repoParam = searchParams.get('repo'); // e.g., ?repo=chaicodehq/cs231
  const { data: session } = useSession();
  const [isClient, setIsClient] = useState(false);

  // Prevent Hydration mismatches with IndexedDB
  useEffect(() => {
    const timer = setTimeout(() => setIsClient(true), 0);
    return () => clearTimeout(timer);
  }, []);

  // Initialize the SWR Engine for this specific repository (0 delay, it's the only one on screen)
  const { progress, status, error, runHeavySync } = useAssignmentSync(repoParam || '', 0);

  if (!isClient) return null;

  if (!repoParam) {
    return (
      <div className="min-h-screen bg-brand-dark flex flex-col items-center justify-center text-text-primary p-4">
        <div className="glass-card max-w-md w-full text-center flex flex-col gap-4 p-10 !transform-none cursor-default">
          <span className="text-4xl mb-2">📡</span>
          <h1 className="text-xl font-display font-bold">No Repository Selected</h1>
          <p className="text-text-muted text-sm">Please select an assignment from the Control Room to view its telemetry.</p>
          <Link href="/main-dashboard" className="mt-4 btn-primary justify-center">Return to Control Room</Link>
        </div>
      </div>
    );
  }

  // --- STATE TRANSLATOR (Hook Data -> Visual States) ---
  const isLoading = status === 'fetching' || status === 'polling';
  let uiState: 'stale' | 'fetching' | 'success' | 'error' = 'stale';
  let statusText = 'Cached (Sleeping)';

  if (isLoading) {
    uiState = 'fetching';
    statusText = 'Extracting AWS Logs...';
  } else if (error && !progress) {
    // True fatal error
    uiState = 'error';
    statusText = 'Network Error / 404';
  } else if (progress) {
    // WE HAVE DATA: Let the score dictate the colors
    if (progress.totalMax > 0 && progress.totalEarned === progress.totalMax) {
      uiState = 'success';
      statusText = error ? 'Tests Passed (Cached)' : 'Tests Passed';
    } else if (progress.totalEarned > 0) {
      uiState = 'fetching';
      statusText = error ? 'In Progress (Cached)' : 'In Progress';
    } else {
      uiState = 'stale';
      statusText = error ? 'Pending (Cached)' : 'Pending';
    }
  }

  const cleanName = repoParam.split('/')[1]?.replace(/-[a-zA-Z0-9]+$/, '') || repoParam;
  const displayScore = progress ? progress.totalEarned : '?';
  const displayMax = progress ? progress.totalMax : '--';
  const totalTests = progress?.results?.length || 0;
  const failingTests = progress?.results?.filter(t => t.status !== 'passed').length || 0;

  return (
    <div className="relative flex flex-col min-h-screen bg-brand-dark text-text-primary font-sans overflow-x-hidden">

      {/* Main Content Area */}
      <main className="page-container">
        {/* Constrain width for better reading measure on detail pages */}
        <div className="w-full max-w-250 flex flex-col">

          <Link href="/dashboard" className="inline-flex items-center gap-2 text-text-muted text-[13px] font-medium mb-10 transition-colors hover:text-text-primary w-fit">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>
            Back to Control Room
          </Link>

          {/* Assignment Header Summary */}
          <div className="flex flex-col md:flex-row justify-between items-start mb-12 gap-6">
            <div className="flex flex-col">
              <div className="label-micro mb-3">
                {repoParam.split('/')[0].toUpperCase()}
              </div>

              <h1 className="font-display text-[3rem] font-bold leading-[1.1] text-white mb-4 tracking-tight">
                <a
                  href={`https://github.com/${repoParam}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group inline-flex items-center gap-4 hover:text-brand-orange transition-colors"
                  title="Open Repository in GitHub"
                >
                  {cleanName}
                </a>
              </h1>

              <div className="flex flex-wrap items-center gap-3 text-text-muted text-[13px] font-mono">
                <span className="flex items-center gap-2 bg-white/5 border border-ui-border-light px-2 py-0.5 rounded text-white">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="18" cy="18" r="3"></circle><circle cx="6" cy="6" r="3"></circle><path d="M13 6h3a2 2 0 0 1 2 2v7"></path><line x1="6" y1="9" x2="6" y2="21"></line></svg>
                  {progress?.commit?.substring(0, 7) || 'waiting'}
                </span>
                <span className="text-text-dim">•</span>
                <span className={uiState === 'error' ? 'text-brand-orange' : 'p-0.5 border border-status-blue/20 bg-status-blue/10 text-status-blue'}>
                  {statusText}
                </span>
                {progress?.workflowStatus && (
                  <>
                    <span className="text-text-dim">•</span>
                    <span className="text-brand-orange animate-pulse flex items-center gap-1">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline></svg>
                      {progress.workflowStatus}
                    </span>
                  </>
                )}
              </div>
            </div>

            {/* Dynamic Score Card */}
            <div className={`glass-card flex py-6 px-8 gap-8 m-0 !transform-none cursor-default border ${uiState === 'success' ? 'border-status-green/30 shadow-[0_0_20px_rgba(46,204,113,0.05)]' : uiState === 'error' ? 'border-brand-orange/40' : 'border-ui-border'}`}>
              <div className="flex flex-col">
                <div className="label-micro mb-2">{error && progress ? 'CACHED SCORE' : 'LATEST SCORE'}</div>
                <div className="flex items-baseline gap-1">
                  <span className={`font-display text-[2.5rem] font-bold leading-none ${isLoading ? 'text-text-dim' : uiState === 'success' ? 'text-status-green' : 'text-white'}`}>
                    {displayScore}
                  </span>
                  <span className="text-sm text-text-dim font-sans font-medium">/ {displayMax}</span>
                </div>
              </div>
              <div className="w-px bg-ui-border"></div>
              <div className="flex flex-col">
                <div className="label-micro mb-2">TEST MATRIX</div>
                <div className={`font-display text-2xl font-bold leading-none mb-1 ${isLoading ? 'text-text-dim' : 'text-white'}`}>
                  {totalTests - failingTests} <span className="text-base text-text-dim font-sans font-medium">/ {totalTests}</span>
                </div>
                {failingTests > 0 ? (
                  <div className="text-xs text-brand-orange font-medium">{failingTests} failing</div>
                ) : (
                  <div className="text-xs text-text-muted">All tests passed</div>
                )}
              </div>
            </div>
          </div>

          {/* Test Runs Section mapped to SWR progress.results */}
          <div className="bg-ui-card border border-ui-border rounded-xl overflow-hidden mb-12">
            <div className="p-6 md:px-8 border-b border-ui-border flex justify-between items-center bg-black/20">
              <div className="flex flex-col">
                <div className="label-micro mb-1">EXTRACTED.LOG</div>
                <h2 className="font-display text-xl font-bold text-white leading-none">Test Matrix</h2>
              </div>
              <button
                onClick={runHeavySync}
                disabled={isLoading}
                className="bg-white/5 border border-ui-border-light rounded-md px-4 py-2 flex items-center gap-2 text-text-primary text-xs font-medium cursor-pointer transition-colors hover:border-ui-border hover:bg-white/10 disabled:opacity-50"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 12a9 9 0 1 1-9-9c2.52 0 4.93 1 6.74 2.74L21 8" /><path d="M21 3v5h-5" /></svg>
                Force Sync
              </button>
            </div>

            <div className="flex flex-col">
              {isLoading && !progress?.results && (
                <div className="py-12 flex flex-col items-center justify-center text-text-dim gap-4">
                  <div className="w-6 h-6 border-2 border-status-blue border-t-transparent rounded-full animate-spin"></div>
                  <span className="font-mono text-xs text-status-blue">Extracting AWS Logs server-side...</span>
                </div>
              )}

              {error && !progress && (
                <div className="py-8 px-8 text-brand-orange font-mono text-sm border-b border-brand-orange/20 bg-brand-orange/5">
                  [NETWORK_ERROR] {error}
                </div>
              )}

              {progress?.results && progress.results.length === 0 && (
                <div className="py-8 px-8 text-text-muted font-mono text-sm text-center">
                  No tests detected in workflow execution.
                </div>
              )}

              {progress?.results && progress.results.map((test, i) => {
                const isFailed = test.status !== 'passed' && test.status !== 'pending';
                const isPending = test.status === 'pending';

                return (
                  <div key={i} className={`grid grid-cols-[1fr_auto] md:grid-cols-[2fr_1fr_auto] py-4 px-6 md:px-8 border-b border-ui-border-light items-center font-mono text-[13px] gap-y-2 md:gap-4 last:border-none ${isFailed ? 'bg-brand-red/5 border-l-2 border-l-brand-red' : isPending ? 'bg-brand-orange/5 border-l-2 border-l-brand-orange' : ''}`}>

                    <div className="flex items-center gap-3 col-span-2 md:col-span-1 pr-4">
                      <div className={`flex items-center justify-center w-4 h-4 rounded-full border p-0.5 shrink-0 ${isFailed ? 'text-brand-red border-brand-red/30' : isPending ? 'text-brand-orange border-brand-orange/30' : 'text-status-green border-status-green/30'}`}>
                        {isFailed ? (
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                        ) : isPending ? (
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
                        ) : (
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12"></polyline></svg>
                        )}
                      </div>
                      <span className={`${isFailed ? 'text-white' : isPending ? 'text-text-muted' : 'text-white'} truncate`} title={test.test}>
                        {test.test}
                      </span>
                    </div>

                    {/* Score / Output cell */}
                    <div className={`md:text-right md:pr-8 truncate col-span-1 md:col-span-1 ml-7 md:ml-0 ${isFailed ? 'text-brand-red' : isPending ? 'text-brand-orange' : 'text-text-muted'}`}>
                      {isFailed ? 'Execution Failed' : isPending ? 'Skipped / Pending' : 'Passed'}
                    </div>

                    <div className={`text-right shrink-0 col-span-1 md:col-span-1 font-bold ${isFailed ? 'text-brand-red' : isPending ? 'text-brand-orange' : 'text-status-green'}`}>
                      {test.earned} <span className="text-text-dim font-medium">/ {test.max}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default function AssignmentPage() {
  return (
    <Suspense fallback={<AssignmentSkeleton />}>
      <AssignmentContent />
    </Suspense>
  );
}

function AssignmentSkeleton() {
  return (
    <div className="page-container">
      <div className="w-full max-w-250 flex flex-col animate-pulse">

        {/* Back Link Placeholder */}
        <div className="w-32 h-4 bg-white/5 rounded mb-10"></div>

        {/* Assignment Header Summary Skeleton */}
        <div className="flex flex-col md:flex-row justify-between items-start mb-12 gap-6">
          <div className="flex flex-col gap-4 w-full md:w-1/2">
            <div className="w-20 h-3 bg-white/10 rounded"></div>
            <div className="w-3/4 h-12 bg-white/5 rounded-lg"></div>
            <div className="flex gap-3 mt-1">
              <div className="w-24 h-6 bg-white/5 rounded border border-white/5"></div>
              <div className="w-24 h-6 bg-white/5 rounded border border-white/5"></div>
            </div>
          </div>

          {/* Score Card Skeleton */}
          <div className="glass-card flex py-6 px-8 gap-8 m-0 w-full md:w-[320px] border-ui-border !transform-none">
            <div className="flex flex-col gap-2 w-1/2">
              <div className="w-24 h-3 bg-white/10 rounded"></div>
              <div className="w-16 h-10 bg-white/10 rounded"></div>
            </div>
            <div className="w-px bg-ui-border"></div>
            <div className="flex flex-col gap-2 w-1/2">
              <div className="w-24 h-3 bg-white/10 rounded"></div>
              <div className="w-16 h-8 bg-white/10 rounded mt-1"></div>
              <div className="w-20 h-3 bg-white/5 rounded mt-1"></div>
            </div>
          </div>
        </div>

        {/* Test Matrix Skeleton */}
        <div className="bg-ui-card border border-ui-border rounded-xl overflow-hidden mb-12">
          {/* Matrix Header */}
          <div className="p-6 md:px-8 border-b border-ui-border flex justify-between items-center bg-black/20">
            <div className="flex flex-col gap-2">
              <div className="w-24 h-3 bg-white/10 rounded"></div>
              <div className="w-32 h-6 bg-white/5 rounded"></div>
            </div>
            <div className="w-28 h-8 bg-white/5 rounded-md border border-white/5"></div>
          </div>

          {/* Matrix Rows */}
          <div className="flex flex-col">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="grid grid-cols-[1fr_auto] md:grid-cols-[2fr_1fr_auto] py-4 px-6 md:px-8 border-b border-ui-border-light items-center gap-y-2 md:gap-4 last:border-none">
                <div className="flex items-center gap-3 col-span-2 md:col-span-1 pr-4">
                  <div className="w-4 h-4 rounded-full bg-white/10 shrink-0 border border-white/5"></div>
                  <div className="w-48 h-4 bg-white/5 rounded"></div>
                </div>
                <div className="md:text-right truncate col-span-1 md:col-span-1 ml-7 md:ml-0 flex justify-start md:justify-end">
                  <div className="w-24 h-4 bg-white/5 rounded"></div>
                </div>
                <div className="flex justify-end col-span-1 md:col-span-1">
                  <div className="w-12 h-4 bg-white/10 rounded"></div>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
