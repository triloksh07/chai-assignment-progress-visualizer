// lib/auth.ts
import { NextAuthOptions, Account } from "next-auth";
import { JWT } from "next-auth/jwt";
import GithubProvider from "next-auth/providers/github";

// The GitHub Refresh Function
async function refreshGitHubAccessToken(token: JWT): Promise<JWT> {
  try {
    const response = await fetch(
      "https://github.com/login/oauth/access_token",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          client_id: process.env.GITHUB_CLIENT_ID,
          client_secret: process.env.GITHUB_CLIENT_SECRET,
          grant_type: "refresh_token",
          refresh_token: token.refreshToken,
        }),
      }
    );

    const refreshedTokens = await response.json();

    if (!response.ok || refreshedTokens.error) {
      throw refreshedTokens;
    }

    return {
      ...token,
      accessToken: refreshedTokens.access_token,
      // Fall back to old refresh token if GitHub doesn't issue a new one
      refreshToken: refreshedTokens.refresh_token ?? token.refreshToken,
      // Convert 'expires_in' (seconds) to absolute timestamp (milliseconds)
      accessTokenExpires: Date.now() + refreshedTokens.expires_in * 1000,
    };
  } catch (error) {
    console.error("Error refreshing access token", error);
    return {
      ...token,
      error: "RefreshAccessTokenError",
    };
  }
}

// The NextAuth Configuration
export const authOptions: NextAuthOptions = {
  providers: [
    GithubProvider({
      clientId: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
    }),
  ],
  callbacks: {
    async jwt({
      token,
      account,
    }: {
      token: JWT;
      account: Account | null;
    }): Promise<JWT> {
      // Initial sign in
      if (account) {
        return {
          ...token,
          accessToken: account.access_token,
          refreshToken: account.refresh_token,
          // account.expires_at is usually in seconds
          accessTokenExpires: account.expires_at! * 1000,
        };
      }

      // Return previous token if the access token has not expired yet
      // (Add a 5-minute buffer to prevent token expiring mid-request)
      if (Date.now() < token.accessTokenExpires! - 5 * 60 * 1000) {
        return token;
      }

      // Access token has expired, try to update it
      return refreshGitHubAccessToken(token);
    },
    async session({ session, token }) {
      // Expose the access token to the frontend/backend routes
      session.accessToken = token.accessToken;
      session.error = token.error;
      return session;
    },
  },
};
