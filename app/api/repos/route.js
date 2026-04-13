import { NextResponse } from 'next/server';
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]/route";

export async function GET(req) {
    try {
        // 🔒 Extract token from session
        const session = await getServerSession(authOptions);

        if (!session || !session.accessToken) {
            return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
        }

        const token = session.accessToken;

        // Fetch repositories where the user is a collaborator or org member
        // We use per_page=100 to ensure we get a good chunk of them in one request
        const response = await fetch('https://api.github.com/user/repos?affiliation=collaborator,organization_member&sort=updated&per_page=100', {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Accept': 'application/vnd.github.v3+json'
            }
        });

        if (!response.ok) throw new Error(`GitHub API Error: ${response.status}`);

        const repos = await response.json();

        // Filter ONLY the assignments from the target organization
        // We look for repos that start with "chaicodehq/" 
        const classroomRepos = repos
            .filter(repo => repo.full_name.toLowerCase().startsWith('chaicodehq/'))
            .map(repo => ({
                id: repo.id,
                name: repo.name, // e.g., "js-async-oops-triloksh07"
                fullName: repo.full_name, // e.g., "chaicodehq/js-async-oops-triloksh07"
                url: repo.html_url,
                updatedAt: repo.updated_at
            }));

        return NextResponse.json({ repos: classroomRepos });

    } catch (error) {
        console.error("Repo Fetch Error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}