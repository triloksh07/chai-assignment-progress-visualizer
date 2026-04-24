import NextAuth from "next-auth";
import { JWT } from "next-auth/jwt";

// 1. Augment the NextAuth Session object
declare module "next-auth" {
  interface Session {
    accessToken?: string;
    error?: string;
    user?: DefaultSession["user"];
  }
}

// 2. Augment the NextAuth JWT object
declare module "next-auth/jwt" {
  interface JWT {
    accessToken?: string;
    refreshToken?: string;
    accessTokenExpires?: number;
    error?: string;
  }
}
