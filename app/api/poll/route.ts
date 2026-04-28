import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { logger } from "@/lib/logger";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const token = await getToken({ req });
    if (!token || !token.accessToken) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { repoPath } = body;

    if (!repoPath)
      return NextResponse.json({ error: "Missing repoPath" }, { status: 400 });

    logger.info({ repoPath }, "Start poll pipeline");

    // Fetch ONLY the latest commit (per_page=1) to save massive bandwidth
    const response = await fetch(
      `https://api.github.com/repos/${repoPath}/commits?per_page=1`,
      {
        headers: {
          Authorization: `Bearer ${token.accessToken}`,
          Accept: "application/vnd.github.v3+json",
          "X-GitHub-Api-Version": "2022-11-28",
        },
        cache: "no-store",
      }
    );

    if (!response.ok) {
      return NextResponse.json(
        { error: "Failed to fetch commit" },
        { status: response.status }
      );
    }

    const data = await response.json();

    if (!data || data.length === 0) {
      return NextResponse.json({ commit: null });
    }

    logger.info({
        repoPath,
    }, 'Poll successful');

    // Return just the 7-character short SHA
    return NextResponse.json({ commit: data[0].sha.substring(0, 7) });
  } catch (error: unknown) {
    return NextResponse.json(
      { error: `Internal Error: \n ${error}` },
      { status: 500 }
    );
  }
}
