import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../../auth/[...nextauth]/route";
import { cookies } from "next/headers";
import { decode } from "next-auth/jwt";
import { prisma } from "@/lib/prisma";
import { emitToUser } from "@/lib/socket";

const participantSelect = {
  select: {
    id: true,
    username: true,
    profilePic: true,
    isPrivate: true,
    isOnline: true,
    lastSeen: true,
  },
};

type ParticipantPayload = Record<string, unknown> & {
  lastSeen: Date | null;
};

type SerializedParticipant = Record<string, unknown> & {
  lastSeen: string | null;
};

const serializeUser = (
  user?: ParticipantPayload | null
): SerializedParticipant | undefined =>
  user
    ? ({
        ...user,
        lastSeen: user.lastSeen ? user.lastSeen.toISOString() : null,
      } as SerializedParticipant)
    : undefined;

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

// GET all messages for a specific chat
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> | { id: string } }
) {
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

    const resolvedParams = await Promise.resolve(params);
    const chatId = parseInt(resolvedParams.id);

    // Verify user has access to this chat
    const chat = await prisma.chat.findFirst({
      where: {
        id: chatId,
        OR: [{ user1Id: user.id }, { user2Id: user.id }],
      },
      include: {
        user1: participantSelect,
        user2: participantSelect,
      },
    });

    if (!chat) {
      return NextResponse.json(
        { error: "Chat not found or access denied" },
        { status: 404 }
      );
    }

    // Fetch all messages for the chat
    const messages = await prisma.message.findMany({
      where: { chatId },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            profilePic: true,
            isPrivate: true,
            isOnline: true,
            lastSeen: true,
          },
        },
        readReceipts: {
          select: {
            userId: true,
            readAt: true,
          },
        },
      },
      orderBy: { createdAt: "asc" },
    });

    const unreadMessageIds = messages
      .filter(
        (msg) =>
          msg.userId !== user.id &&
          !msg.readReceipts.some((receipt) => receipt.userId === user.id)
      )
      .map((msg) => msg.id);

    if (unreadMessageIds.length > 0) {
      const receiptData = unreadMessageIds.map((messageId) => ({
        messageId,
        userId: user.id,
        readAt: new Date(),
      }));

      await prisma.messageReadReceipt.createMany({
        data: receiptData,
        skipDuplicates: true,
      });

      receiptData.forEach((receipt) => {
        const message = messages.find((msg) => msg.id === receipt.messageId);
        if (message) {
          message.readReceipts.push({
            userId: receipt.userId,
            readAt: receipt.readAt,
          });
        }
      });

      const otherUserId = chat
        ? chat.user1Id === user.id
          ? chat.user2Id
          : chat.user1Id
        : undefined;
      if (otherUserId) {
        emitToUser(otherUserId, "message:read", {
          chatId,
          receipts: receiptData.map((receipt) => ({
            messageId: receipt.messageId,
            userId: receipt.userId,
            readAt: receipt.readAt.toISOString(),
          })),
        });
      }
    }

    // Transform messages to include user data
    const transformedMessages = messages.map((msg) => ({
      id: msg.id,
      chatId: msg.chatId,
      userId: msg.userId,
      messageText: msg.messageText,
      toxicityScore: msg.toxicityScore,
      toxicityCategory: msg.toxicityCategory,
      emotion: msg.emotion,
      isFlagged: msg.isFlagged,
      createdAt: msg.createdAt.toISOString(),
      user: serializeUser(msg.user),
      readReceipts: msg.readReceipts.map((receipt) => ({
        userId: receipt.userId,
        readAt: receipt.readAt.toISOString(),
      })),
    }));

    return NextResponse.json({ messages: transformedMessages });
  } catch (error) {
    console.error("Error fetching messages:", error);
    return NextResponse.json(
      { error: "Failed to fetch messages" },
      { status: 500 }
    );
  }
}

// POST send a new message
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> | { id: string } }
) {
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

    const resolvedParams = await Promise.resolve(params);
    const chatId = parseInt(resolvedParams.id);

    // Verify user has access to this chat
    const chat = await prisma.chat.findFirst({
      where: {
        id: chatId,
        OR: [{ user1Id: user.id }, { user2Id: user.id }],
      },
      include: {
        user1: participantSelect,
        user2: participantSelect,
      },
    });

    if (!chat) {
      return NextResponse.json(
        { error: "Chat not found or access denied" },
        { status: 404 }
      );
    }

    const body = await request.json();
    const { messageText } = body;

    if (!messageText || typeof messageText !== "string" || messageText.trim().length === 0) {
      return NextResponse.json(
        { error: "Message text is required" },
        { status: 400 }
      );
    }

    // Create the message
    const message = await prisma.message.create({
      data: {
        chatId,
        userId: user.id,
        messageText: messageText.trim(),
      },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            profilePic: true,
            isPrivate: true,
            isOnline: true,
            lastSeen: true,
          },
        },
        readReceipts: {
          select: {
            userId: true,
            readAt: true,
          },
        },
      },
    });

    // Update chat's updatedAt timestamp
    await prisma.chat.update({
      where: { id: chatId },
      data: { updatedAt: new Date() },
    });

    // Transform message
    const transformedMessage = {
      id: message.id,
      chatId: message.chatId,
      userId: message.userId,
      messageText: message.messageText,
      toxicityScore: message.toxicityScore,
      toxicityCategory: message.toxicityCategory,
      emotion: message.emotion,
      isFlagged: message.isFlagged,
      createdAt: message.createdAt.toISOString(),
      user: serializeUser(message.user),
      readReceipts: message.readReceipts.map((receipt) => ({
        userId: receipt.userId,
        readAt: receipt.readAt.toISOString(),
      })),
    };

    if (chat) {
      const recipientId = chat.user1Id === user.id ? chat.user2Id : chat.user1Id;
      const chatPreview = {
        id: chat.id,
        user1Id: chat.user1Id,
        user2Id: chat.user2Id,
        type: chat.type,
        title: chat.title,
        createdAt: chat.createdAt.toISOString(),
        updatedAt: transformedMessage.createdAt,
        user1: serializeUser(chat.user1),
        user2: serializeUser(chat.user2),
        lastMessage: transformedMessage,
      };

      if (recipientId) {
        emitToUser(recipientId, "message:new", {
          chatId,
          message: transformedMessage,
          chatPreview,
        });
      }
    }

    return NextResponse.json({ message: transformedMessage }, { status: 201 });
  } catch (error) {
    console.error("Error sending message:", error);
    return NextResponse.json(
      { error: "Failed to send message" },
      { status: 500 }
    );
  }
}

