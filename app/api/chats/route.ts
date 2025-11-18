import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]/route";
import { cookies } from "next/headers";
import { decode } from "next-auth/jwt";
import { prisma } from "@/lib/prisma";

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

// GET all chats for the current user
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
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Fetch all chats where user is either user1 or user2
    const chats = await prisma.chat.findMany({
      where: {
        OR: [{ user1Id: user.id }, { user2Id: user.id }],
      },
      include: {
        user1: {
          select: {
            id: true,
            username: true,
            profilePic: true,
          },
        },
        user2: {
          select: {
            id: true,
            username: true,
            profilePic: true,
          },
        },
        messages: {
          orderBy: { createdAt: "desc" },
          take: 1,
          include: {
            user: {
              select: {
                id: true,
                username: true,
                profilePic: true,
              },
            },
          },
        },
      },
      orderBy: { updatedAt: "desc" },
    });

    // Transform chats to include last message
    const transformedChats = chats.map((chat) => {
      const lastMessage = chat.messages[0] || null;
      return {
        id: chat.id,
        user1Id: chat.user1Id,
        user2Id: chat.user2Id,
        type: chat.type,
        title: chat.title,
        createdAt: chat.createdAt.toISOString(),
        updatedAt: chat.updatedAt.toISOString(),
        user1: chat.user1,
        user2: chat.user2,
        lastMessage: lastMessage
          ? {
              id: lastMessage.id,
              chatId: lastMessage.chatId,
              userId: lastMessage.userId,
              messageText: lastMessage.messageText,
              toxicityScore: lastMessage.toxicityScore,
              toxicityCategory: lastMessage.toxicityCategory,
              emotion: lastMessage.emotion,
              isFlagged: lastMessage.isFlagged,
              createdAt: lastMessage.createdAt.toISOString(),
              user: lastMessage.user,
            }
          : undefined,
      };
    });

    return NextResponse.json({ chats: transformedChats });
  } catch (error) {
    console.error("Error fetching chats:", error);
    return NextResponse.json(
      { error: "Failed to fetch chats" },
      { status: 500 }
    );
  }
}

