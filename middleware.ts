import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const path = req.nextUrl.pathname;

    // Check if user is trying to access moderation routes
    if (path.startsWith("/moderation")) {
      // Check if user has moderator or admin role
      if (!token?.role || (token.role !== "MODERATOR" && token.role !== "ADMIN")) {
        // Redirect to home page or show access denied
        return NextResponse.redirect(new URL("/", req.url));
      }
    }

    return NextResponse.next();
  },
  {
    pages: {
      signIn: "/auth/login",
    },
    callbacks: {
      authorized: ({ token }) => !!token,
    },
  }
);

export const config = {
  matcher: ["/chat/:path*", "/profile/:path*", "/moderation/:path*"],
};
