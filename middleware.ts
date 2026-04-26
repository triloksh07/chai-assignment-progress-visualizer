// middleware.ts
import { withAuth } from "next-auth/middleware";

// Export the default NextAuth middleware
export default withAuth({
  pages: {
    signIn: "/new/lp2", // If an unauthenticated user tries to hit a protected route, send them to the landing page
  },
});

// Define exactly which routes should be locked behind the authentication wall
export const config = {
    matcher: [
        // "/new/ds/:path*",
        "/new/as/:path*"
      ],
};
