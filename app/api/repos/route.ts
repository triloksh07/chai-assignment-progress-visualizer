import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { GitHubRepoResponse, ClassroomRepo } from "@/types";
import { logger } from "@/lib/logger";

// 🛑 FORCE DYNAMIC: Never cache the user's repository list
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    // SECURITY: Read JWT directly, server-side only
    const token = await getToken({ req });

    if (!token || !token.accessToken) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    const githubToken = token.accessToken as string;

    // Fetch repositories where the user is a collaborator or org member
    // We use per_page=100 to ensure we get a good chunk of them in one request
    const response = await fetch(
      "https://api.github.com/user/repos?affiliation=collaborator,organization_member&sort=updated&per_page=100",
      {
        headers: {
          Authorization: `Bearer ${githubToken}`,
          Accept: "application/vnd.github.v3+json",
        },
        cache: "no-store", // EXPLICITLY DISABLE FETCH CACHE
      }
    );

    if (!response.ok) {
      // Case A: Token expired or revoked
      if (response.status === 401) {
        logger.warn(
          { response, status: response.status },
          "GitHub API Interaction"
        );
        return NextResponse.json(
          { error: "GitHub session expired. Please sign out and reconnect." },
          { status: 401 }
        );
      }
      // Case B: GitHub Rate Limiting
      if (response.status === 403 || response.status === 429) {
        logger.warn(
          { response, status: response.status },
          "GitHub API Rate Limit Hit"
        );
        return NextResponse.json(
          { error: "GitHub API rate limit exceeded. Please wait." },
          { status: 429 }
        );
      }

      // Case C: Generic Fallback
      return NextResponse.json(
        { error: `GitHub API Error: ${response.status}` },
        { status: response.status }
      );
    }

    const repos: GitHubRepoResponse[] = await response.json();

    const orgPrefix = process.env.GITHUB_ORG!.toLowerCase() + "/";

    // Filter ONLY the assignments from the target organization
    const classroomRepos: ClassroomRepo[] = repos
      .filter((repo) => repo.full_name.toLowerCase().startsWith(orgPrefix))
      .map((repo) => ({
        id: repo.id,
        name: repo.name,
        fullName: repo.full_name,
        url: repo.html_url,
        updatedAt: repo.updated_at,
      }));

    return NextResponse.json({ repos: classroomRepos });
  } catch (error: unknown) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
