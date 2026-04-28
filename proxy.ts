// middleware.ts
import { withAuth } from "next-auth/middleware";

// Export the default NextAuth middleware
export default withAuth({
  pages: {
    signIn: "/",
  },
});

// Define exactly which routes should be locked behind the authentication wall
export const config = {
  matcher: ["/dashboard/:path*", "/assignment/:path*"],
};
