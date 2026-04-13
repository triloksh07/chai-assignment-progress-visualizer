import { NextResponse } from 'next/server';
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]/route";

async function fetchGitHub(url, token, asText = false) {
    const response = await fetch(`https://api.github.com/${url}`, {
        headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/vnd.github.v3+json',
            'X-GitHub-Api-Version': '2022-11-28'
        }
    });
    // We remove the hard throw here so we can catch specific 404s/409s manually
    return { ok: response.ok, status: response.status, data: asText ? await response.text() : await response.json() };
}

// Helper to generate an empty/pending scorecard
function createPendingScorecard(autogradingData, commitMsg) {
    const results = autogradingData.tests.map(test => ({
        test: test.name,
        earned: 0,
        max: test.points,
        status: 'pending'
    }));
    const totalMax = results.reduce((acc, curr) => acc + curr.max, 0);
    return { results, totalEarned: 0, totalMax, commit: commitMsg };
}

export async function POST(req) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || !session.accessToken) {
            return NextResponse.json({ error: "Unauthorized. Please log in." }, { status: 401 });
        }

        const token = session.accessToken;
        const { repoPath } = await req.json();

        if (!repoPath) return NextResponse.json({ error: "Missing repoPath" }, { status: 400 });

        // 1. Fetch Source of Truth (If this fails, they haven't even accepted the assignment properly)
        const fileRes = await fetchGitHub(`repos/${repoPath}/contents/.github/classroom/autograding.json`, token);
        if (!fileRes.ok) {
            return NextResponse.json({ error: "No autograding.json found. Have you initialized the assignment?" }, { status: 404 });
        }
        const autogradingData = JSON.parse(Buffer.from(fileRes.data.content, 'base64').toString('utf-8'));

        // 2. Check for Commits (Catches completely empty repos)
        const commitRes = await fetchGitHub(`repos/${repoPath}/commits`, token);
        if (!commitRes.ok || commitRes.data.length === 0) {
            return NextResponse.json(createPendingScorecard(autogradingData, "No commits yet"));
        }
        const latestCommit = commitRes.data[0].sha;

        // 3. Check for Workflow Runs
        const runsRes = await fetchGitHub(`repos/${repoPath}/actions/runs?head_sha=${latestCommit}`, token);
        if (!runsRes.ok || runsRes.data.total_count === 0) {
            return NextResponse.json(createPendingScorecard(autogradingData, "Action Pending"));
        }
        const runId = runsRes.data.workflow_runs[0].id;

        // 4. Get Autograding Job
        const jobsRes = await fetchGitHub(`repos/${repoPath}/actions/runs/${runId}/jobs`, token);
        const autogradingJob = jobsRes.data.jobs?.find(j => j.name.toLowerCase().includes('autograding'));
        
        if (!autogradingJob) {
             return NextResponse.json(createPendingScorecard(autogradingData, "Job queued"));
        }

        // 5. Download Raw Logs
        const logRes = await fetchGitHub(`repos/${repoPath}/actions/jobs/${autogradingJob.id}/logs`, token, true);
        if (!logRes.ok) {
            return NextResponse.json(createPendingScorecard(autogradingData, "Waiting for logs..."));
        }
        const rawLog = logRes.data;

        // 6. Parse and Calculate
        const results = autogradingData.tests.map(test => {
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

        return NextResponse.json({ results, totalEarned, totalMax, commit: latestCommit.substring(0, 7) });

    } catch (error) {
        console.error("API Error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}