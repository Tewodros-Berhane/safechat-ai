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

    const exp = typeof decoded.exp === "number" ? decoded.exp : undefined;
    return {
      user: { email: decoded.email, id: decoded.sub },
      expires: exp ? new Date(exp * 1000).toISOString() : new Date().toISOString(),
    };
  } catch (error) {
    console.error("Error decoding session:", error);
    return null;
  }
}

// GET current user
export async function GET() {
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
      select: {
        id: true,
        username: true,
        email: true,
        age: true,
        role: true,
        profilePic: true,
        createdAt: true,
        updatedAt: true,
        _count: {
          select: {
            chats1: true,
            chats2: true,
          },
        },
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Calculate total chat count
    const chatCount =
      (user._count.chats1 || 0) + (user._count.chats2 || 0);

    // Return user without passwordHash
    const { _count, ...userData } = user;

    return NextResponse.json({
      user: {
        ...userData,
        chatCount,
      },
    });
  } catch (error) {
    console.error("Error fetching user:", error);
    return NextResponse.json(
      { error: "Failed to fetch user" },
      { status: 500 }
    );
  }
}

// PATCH update user
export async function PATCH(request: Request) {
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

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const body = await request.json();
    const { username, age, profilePic } = body;

    // Update user
    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: {
        ...(username && { username }),
        ...(age !== undefined && { age }),
        ...(profilePic !== undefined && { profilePic }),
      },
      select: {
        id: true,
        username: true,
        email: true,
        age: true,
        role: true,
        profilePic: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return NextResponse.json({ user: updatedUser });
  } catch (error) {
    console.error("Error updating user:", error);
    return NextResponse.json(
      { error: "Failed to update user" },
      { status: 500 }
    );
  }
}

