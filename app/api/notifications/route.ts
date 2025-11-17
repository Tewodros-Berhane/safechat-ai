import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { PrismaClient } from "@prisma/client";
import { authOptions } from "../auth/[...nextauth]/route";
import { cookies } from "next/headers";
import { decode } from "next-auth/jwt";

const prisma = new PrismaClient();

// Helper function to get session from token
async function getSessionFromRequest() {
  try {
    const cookieStore = await cookies();
    const sessionToken = cookieStore.get(
      process.env.NODE_ENV === "production"
        ? "__Secure-next-auth.session-token"
        : "next-auth.session-token"
    )?.value;

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

    const exp = typeof decoded.exp === 'number' ? decoded.exp : undefined;
    return { 
      user: { email: decoded.email, id: decoded.sub },
      expires: exp ? new Date(exp * 1000).toISOString() : new Date().toISOString()
    };
  } catch (error) {
    console.error("Error decoding session:", error);
    return null;
  }
}

// GET all notifications for the current user
export async function GET(request: Request) {
  try {
    // Try getServerSession first
    let session = await getServerSession(authOptions);
    
    // If that doesn't work, try reading from cookies
    if (!session) {
      session = await getSessionFromRequest();
    }

    if (!session) {
      console.error("No session found");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!session.user?.email) {
      console.error("No email in session", session);
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      console.error("User not found for email:", session.user.email);
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Fetch all notifications for the user, ordered by newest first
    const notifications = await prisma.notification.findMany({
      where: { userId: user.id },
      include: {
        chat: {
          include: {
            user1: { select: { id: true, username: true, profilePic: true } },
            user2: { select: { id: true, username: true, profilePic: true } },
          },
        },
        message: {
          include: {
            user: { select: { id: true, username: true, profilePic: true } },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ notifications });
  } catch (error) {
    console.error("Error fetching notifications:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { error: "Failed to fetch notifications", details: errorMessage },
      { status: 500 }
    );
  }
}

// POST mark all notifications as read
export async function POST(request: Request) {
  try {
    // Try getServerSession first
    let session = await getServerSession(authOptions);
    
    // If that doesn't work, try reading from cookies
    if (!session) {
      session = await getSessionFromRequest();
    }

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Mark all unread notifications as read
    await prisma.notification.updateMany({
      where: {
        userId: user.id,
        isRead: false,
      },
      data: {
        isRead: true,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error marking notifications as read:", error);
    return NextResponse.json(
      { error: "Failed to mark notifications as read" },
      { status: 500 }
    );
  }
}

