import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const path = req.nextUrl.pathname;

    // Moderation access (mods or admins)
    if (path.startsWith("/moderation")) {
      if (!token?.role || (token.role !== "MODERATOR" && token.role !== "ADMIN")) {
        return NextResponse.redirect(new URL("/", req.url));
      }
    }

    // Admin-only routes
    if (path.startsWith("/admin")) {
      if (!token?.role || token.role !== "ADMIN") {
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
  matcher: ["/chat/:path*", "/profile/:path*", "/moderation/:path*", "/admin/:path*"],
};
