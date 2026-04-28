import { NextRequest, NextResponse } from 'next/server';
import { getToken } from "next-auth/jwt";
import { AutogradingConfig, TestResult, ProgressData } from '@/types';
import { logger } from '@/lib/logger';

// 🛑 FORCE DYNAMIC: Completely disables Next.js server-side caching for this entire route
export const dynamic = 'force-dynamic';

// Strict shapes for GitHub's various API responses
interface GitHubFileContent { content: string; }
interface GitHubCommit { sha: string; }
interface GitHubWorkflowRuns { total_count: number; workflow_runs: { id: number }[]; }
interface GitHubJobs { jobs: { id: number; name: string }[]; }

// The Generic Response Wrapper
interface GitHubResponse<T> {
    ok: boolean;
    status: number;
    data: T;
    rateLimitRemaining: string | null;
}

// The Generic Fetch Wrapper
async function fetchGitHub<T>(url: string, token: string, asText = false, retries = 3): Promise<GitHubResponse<T>> {
    for (let i = 0; i < retries; i++) {
        try {
            const response = await fetch(`https://api.github.com/${url}`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Accept': 'application/vnd.github.v3+json',
                    'X-GitHub-Api-Version': '2022-11-28'
                },
                cache: 'no-store' // EXPLICITLY DISABLE FETCH CACHE
            });

            const remaining = response.headers.get('x-ratelimit-remaining');
            const limit = response.headers.get('x-ratelimit-limit');
            // Log the interaction
            logger.debug({ url, remaining, limit, status: response.status }, 'GitHub API Interaction');

            // If GitHub is actively rate limiting us (403 or 429), don't retry, just fail gracefully
            if (response.status === 403 || response.status === 429) {
                logger.warn({ url, remaining }, 'GitHub Rate Limit Hit');
                // Cast null to T only for explicit failure states
                return { ok: false, status: response.status, data: null as unknown as T, rateLimitRemaining: remaining };
            }

            const data = asText ? await response.text() : await response.json();

            return {
                ok: response.ok,
                status: response.status,
                data: data as T,
                rateLimitRemaining: remaining
            };

        } catch (err: unknown) {
            // If it's the last retry, throw the error so the main catch block can log it
            if (i === retries - 1) {
                logger.error({ url, attempt: i + 1 }, 'GitHub API fetch failed permanently');
                throw err;
            }
            // Otherwise, wait before retrying (500ms, then 1000ms)
            const waitTime = 500 * (i + 1);
            logger.warn({ url, attempt: i + 1, waitTime }, 'Network drop. Retrying GitHub API...');
            await new Promise(res => setTimeout(res, waitTime));
        }
    }
    throw new Error("Fetch failed after retries");
}

function createPendingScorecard(
    autogradingData: AutogradingConfig,
    statusMsg?: string,
    commitHash?: string,
): ProgressData {
    const results: TestResult[] = autogradingData.tests.map((test) => ({
        test: test.name,
        earned: 0,
        max: test.points,
        status: 'pending'
    }));
    const totalMax = results.reduce((acc, curr) => acc + curr.max, 0);

    const finalCommit = commitHash ? commitHash.substring(0, 7) : "";

    return { results, totalEarned: 0, totalMax, commit: finalCommit, workflowStatus: statusMsg };
}

export async function POST(req: NextRequest) {
    const startTime = Date.now();
    let repoPath = 'unknown';

    try {
        const token = await getToken({ req });
        if (!token || !token.accessToken) {
            logger.warn('Unauthorized attempt to access /api/progress');
            return NextResponse.json({ error: "Unauthorized. Please log in." }, { status: 401 });
        }

        const githubToken = token.accessToken as string;
        const body = await req.json();
        repoPath = body.repoPath as string;

        if (!repoPath) return NextResponse.json({ error: "Missing repoPath" }, { status: 400 });

        // SECURITY FIX: Strict format validation (Prevents SSRF)
        const repoRegex = /^[a-zA-Z0-9_.-]+\/[a-zA-Z0-9_.-]+$/;
        if (!repoRegex.test(repoPath)) {
            logger.warn({ repoPath }, 'Invalid repository format provided');
            return NextResponse.json({ error: "Invalid repository format" }, { status: 400 });
        }

        logger.info({ repoPath }, 'Starting log extraction pipeline');

        // 1. Fetch Source of Truth & Rate Limit (If this fails, they haven't even accepted the assignment properly)

        const fileRes = await fetchGitHub<GitHubFileContent>(`repos/${repoPath}/contents/.github/classroom/autograding.json`, githubToken);
        const currentRateLimit = fileRes.rateLimitRemaining || 'Unknown';

        if (!fileRes.ok) {
            // Case A: Token expired or revoked
            if (fileRes.status === 401) {
                logger.warn({ repoPath }, 'GitHub token expired or unauthorized');
                return NextResponse.json({ error: "GitHub session expired. Please sign out and reconnect." }, { status: 401 });
            }
            // Case B: GitHub Rate Limiting
            if (fileRes.status === 403 || fileRes.status === 429) {
                logger.warn({ repoPath, rateLimitRemaining: currentRateLimit }, 'GitHub API Rate Limit Hit');
                return NextResponse.json({ error: "GitHub API rate limit exceeded. Please wait." }, { status: 429 });
            }
            // Case C: The file ACTUALLY does not exist 
            if (fileRes.status === 404) {
                logger.warn({ repoPath }, 'Exit: No autograding.json found (True 404)');
                return NextResponse.json({ error: "No autograding.json found. Manual review required." }, { status: 404 });
            }

            // Case D: Generic Fallback
            return NextResponse.json({ error: `GitHub API Error: ${fileRes.status}` }, { status: fileRes.status });
        }

        if (!fileRes.data || !fileRes.data.content) {
            return NextResponse.json({ error: "Malformed autograding file." }, { status: 500 });
        }

        const autogradingData: AutogradingConfig = JSON.parse(Buffer.from(fileRes.data.content, 'base64').toString('utf-8'));

        // 2. Check for Commits (Catches completely empty repos)
        const commitRes = await fetchGitHub<GitHubCommit[]>(`repos/${repoPath}/commits`, githubToken);
        if (!commitRes.ok || !commitRes.data || commitRes.data.length === 0) {
            logger.info({ repoPath, state: 'No commits yet', rateLimitRemaining: currentRateLimit }, 'Exit: Pending scorecard returned');
            return NextResponse.json(createPendingScorecard(autogradingData, "No commits yet"));
        }
        
        const latestCommit = commitRes.data[0].sha;

        // 3. Check for Workflow Runs
        const runsRes = await fetchGitHub<GitHubWorkflowRuns>(`repos/${repoPath}/actions/runs?head_sha=${latestCommit}`, githubToken);
        if (!runsRes.ok || !runsRes.data || runsRes.data.total_count === 0) {
            logger.info({ repoPath, state: 'Action Pending', rateLimitRemaining: currentRateLimit }, 'Exit: Pending scorecard returned');
            return NextResponse.json(createPendingScorecard(autogradingData, "Pending", latestCommit));
        }
        const runId = runsRes.data.workflow_runs[0].id;

        // 4. Get Autograding Job
        const jobsRes = await fetchGitHub<GitHubJobs>(`repos/${repoPath}/actions/runs/${runId}/jobs`, githubToken);
        const autogradingJob = jobsRes.data?.jobs?.find(j => j.name.toLowerCase().includes('autograding'));
        if (!autogradingJob) {
            logger.info({ repoPath, state: 'Job queued', rateLimitRemaining: currentRateLimit }, 'Exit: Pending scorecard returned');
            return NextResponse.json(createPendingScorecard(autogradingData, "Job queued", latestCommit));
        }

        // 5. Download Raw Logs
        const logRes = await fetchGitHub<string>(`repos/${repoPath}/actions/jobs/${autogradingJob.id}/logs`, githubToken, true);
        if (!logRes.ok || !logRes.data) {
            logger.info({ repoPath, state: 'Waiting for S3 logs', rateLimitRemaining: currentRateLimit }, 'Exit: Pending scorecard returned');
            return NextResponse.json(createPendingScorecard(autogradingData, "Waiting for logs...", latestCommit));
        }

        const rawLog = logRes.data;

        // 6. Parse and Calculate
        const results: TestResult[] = autogradingData.tests.map((test) => {
            const passed = rawLog.includes(`✅  ${test.name}`) || rawLog.includes(`✅ ${test.name}`);
            const failed = rawLog.includes(`❌  ${test.name}`) || rawLog.includes(`❌ ${test.name}`);
            return {
                test: test.name,
                earned: passed ? test.points : 0,
                max: test.points,
                status: passed ? 'passed' : (failed ? 'failed' : 'pending')
            };
        });

        const totalEarned = results.reduce((acc, curr) => acc + curr.earned, 0);
        const totalMax = results.reduce((acc, curr) => acc + curr.max, 0);
        const executionTime = Date.now() - startTime;

        // Log successful completion with performance metrics and rate limits
        logger.info({
            repoPath,
            executionTimeMs: executionTime,
            score: `${totalEarned}/${totalMax}`,
            rateLimitRemaining: currentRateLimit
        }, 'Log extraction successful');

        const responseData: ProgressData = { results, totalEarned, totalMax, commit: latestCommit.substring(0, 7) };
        return NextResponse.json(responseData);

    } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        logger.error({ repoPath, err: errorMessage }, 'Critical failure during log extraction');
        return NextResponse.json({ error: errorMessage }, { status: 500 });
    }
}