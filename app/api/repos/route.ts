import { NextRequest, NextResponse } from 'next/server';
import { getToken } from "next-auth/jwt";
import { GitHubRepoResponse, ClassroomRepo } from '@/types';

export async function GET(req: NextRequest) {
    try {
        // SECURITY FIX: Read JWT directly, server-side only
        const token = await getToken({ req });

        if (!token || !token.accessToken) {
            return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
        }

        const githubToken = token.accessToken as string;

        // Fetch repositories where the user is a collaborator or org member
        // We use per_page=100 to ensure we get a good chunk of them in one request
        const response = await fetch('https://api.github.com/user/repos?affiliation=collaborator,organization_member&sort=updated&per_page=100', {
            headers: {
                'Authorization': `Bearer ${githubToken}`,
                'Accept': 'application/vnd.github.v3+json'
            }
        });

        if (!response.ok) throw new Error(`GitHub API Error: ${response.status}`);

        const repos: GitHubRepoResponse[] = await response.json();

        const orgPrefix = (process.env.NEXT_PUBLIC_GITHUB_ORG || 'chaicodehq').toLowerCase() + '/';

        // Filter ONLY the assignments from the target organization
        // We look for repos that start with "chaicodehq/" 
        const classroomRepos: ClassroomRepo[] = repos
            .filter((repo) => repo.full_name.toLowerCase().startsWith(orgPrefix))
            .map((repo) => ({
                id: repo.id,
                name: repo.name, // e.g., "js-async-oops-triloksh07"
                fullName: repo.full_name, // e.g., "chaicodehq/js-async-oops-triloksh07"
                url: repo.html_url,
                updatedAt: repo.updated_at
            }));

        return NextResponse.json({ repos: classroomRepos });

    } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        return NextResponse.json({ error: errorMessage }, { status: 500 });
    }
}