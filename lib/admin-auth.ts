import { cookies } from "next/headers";
import { getServerSession } from "next-auth/next";
import { decode } from "next-auth/jwt";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";
import { Role, User } from "@prisma/client";

// Attempts to read the session token directly from cookies to support edge cases
// where getServerSession is unavailable (e.g., during fetches from the client).
async function getSessionFromRequest() {
  try {
    const cookieStore = await cookies();
    const sessionToken =
      cookieStore.get(
        process.env.NODE_ENV === "production"
          ? "__Secure-next-auth.session-token"
          : "next-auth.session-token"
      )?.value || null;

    if (!sessionToken) {
      return null;
    }

    const decoded = await decode({
      token: sessionToken,
      secret: process.env.NEXTAUTH_SECRET || "",
    });

    if (!decoded || !decoded.email) {
      return null;
    }

    const exp = typeof decoded.exp === "number" ? decoded.exp : undefined;
    return {
      user: { email: decoded.email, id: decoded.sub },
      expires: exp
        ? new Date(exp * 1000).toISOString()
        : new Date().toISOString(),
    };
  } catch (error) {
    console.error("Error decoding session:", error);
    return null;
  }
}

export async function getCurrentSessionUser(): Promise<User | null> {
  let session = await getServerSession(authOptions);

  if (!session) {
    session = await getSessionFromRequest();
  }

  if (!session?.user?.email) {
    return null;
  }

  return prisma.user.findUnique({
    where: { email: session.user.email },
  });
}

export async function requireAdminUser(): Promise<User | null> {
  const user = await getCurrentSessionUser();
  if (!user || user.role !== Role.ADMIN) {
    return null;
  }
  return user;
}
