import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function POST() {
  try {
    const cookieStore = await cookies();
    
    // Get all possible NextAuth cookie names
    const cookieNames = [
      "next-auth.session-token",
      "__Secure-next-auth.session-token",
      "next-auth.csrf-token",
      "__Host-next-auth.csrf-token",
    ];

    // Create response
    const response = NextResponse.json(
      { success: true, message: "Logged out successfully" },
      { status: 200 }
    );

    // Delete all NextAuth cookies from cookie store
    cookieNames.forEach((cookieName) => {
      cookieStore.delete(cookieName);
    });

    // Also set cookies in response headers to ensure they're deleted on client
    cookieNames.forEach((cookieName) => {
      response.cookies.set(cookieName, "", {
        expires: new Date(0),
        path: "/",
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
      });
    });

    return response;
  } catch (error) {
    console.error("Logout error:", error);
    return NextResponse.json(
      { error: "Failed to logout" },
      { status: 500 }
    );
  }
}

