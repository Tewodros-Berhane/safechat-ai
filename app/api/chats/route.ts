import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]/route";
import { cookies } from "next/headers";
import { decode } from "next-auth/jwt";
import { prisma } from "@/lib/prisma";
import { emitToUser } from "@/lib/socket";
import { createRealtimeNotification } from "@/lib/notifications";

const chatUserSelect = {
  id: true,
  username: true,
  profilePic: true,
  isPrivate: true,
  isOnline: true,
  lastSeen: true,
};

type RawChatUser = Record<string, unknown> & {
  lastSeen: Date | null;
};

type SerializedChatUser = Record<string, unknown> & {
  lastSeen: string | null;
};

const serializeUser = (user?: RawChatUser | null): SerializedChatUser | undefined =>
  user
    ? ({
        ...user,
        lastSeen: user.lastSeen ? user.lastSeen.toISOString() : null,
      } as SerializedChatUser)
    : undefined;

const chatInclude = {
  user1: { select: chatUserSelect },
  user2: { select: chatUserSelect },
  messages: {
    orderBy: { createdAt: "desc" },
    take: 1,
    include: {
      user: { select: chatUserSelect },
      readReceipts: {
        select: {
          userId: true,
          readAt: true,
        },
      },
    },
  },
};

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

async function getCurrentUser() {
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

function transformChat(
  chat: Awaited<ReturnType<typeof prisma.chat.findFirst>>,
  unreadCount = 0
) {
  if (!chat) {
    return null;
  }

  const lastMessage = chat.messages?.[0] || null;
  return {
    id: chat.id,
    user1Id: chat.user1Id,
    user2Id: chat.user2Id,
    type: chat.type,
    title: chat.title,
    createdAt: chat.createdAt.toISOString(),
    updatedAt: chat.updatedAt.toISOString(),
    user1: serializeUser(chat.user1),
    user2: serializeUser(chat.user2),
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
          user: serializeUser(lastMessage.user),
          readReceipts: lastMessage.readReceipts.map((receipt) => ({
            userId: receipt.userId,
            readAt: receipt.readAt.toISOString(),
          })),
        }
      : undefined,
    unreadCount,
  };
}

// GET all chats for the current user
export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Fetch all chats where user is either user1 or user2
    const chats = await prisma.chat.findMany({
      where: {
        OR: [{ user1Id: user.id }, { user2Id: user.id }],
      },
      include: chatInclude,
      orderBy: { updatedAt: "desc" },
    });

    const chatIds = chats.map((chat) => chat.id);
    const unreadCountsRaw =
      chatIds.length > 0
        ? await prisma.message.groupBy({
            by: ["chatId"],
            where: {
              chatId: { in: chatIds },
              userId: { not: user.id },
              readReceipts: {
                none: {
                  userId: user.id,
                },
              },
            },
            _count: {
              _all: true,
            },
          })
        : [];

    const unreadCountMap = new Map<number, number>(
      unreadCountsRaw.map((entry) => [entry.chatId, entry._count._all])
    );

    // Transform chats to include last message
    const transformedChats = chats.map((chat) =>
      transformChat(chat, unreadCountMap.get(chat.id) || 0)
    );

    return NextResponse.json({
      chats: transformedChats.filter((chat) => chat !== null),
    });
  } catch (error) {
    console.error("Error fetching chats:", error);
    return NextResponse.json(
      { error: "Failed to fetch chats" },
      { status: 500 }
    );
  }
}

// POST create a new direct chat (respecting privacy rules)
export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json().catch(() => null);
    const targetUserId = Number(body?.targetUserId);

    if (!targetUserId || Number.isNaN(targetUserId)) {
      return NextResponse.json(
        { error: "A valid target user is required" },
        { status: 400 }
      );
    }

    if (targetUserId === user.id) {
      return NextResponse.json(
        { error: "You cannot start a chat with yourself" },
        { status: 400 }
      );
    }

    const targetUser = await prisma.user.findUnique({
      where: { id: targetUserId },
      select: { id: true, username: true, isPrivate: true },
    });

    if (!targetUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const existingChat = await prisma.chat.findFirst({
      where: {
        OR: [
          { user1Id: user.id, user2Id: targetUserId },
          { user1Id: targetUserId, user2Id: user.id },
        ],
      },
      include: chatInclude,
    });

    if (existingChat) {
      return NextResponse.json(
        { chat: transformChat(existingChat, 0) },
        { status: 200 }
      );
    }

    if (targetUser.isPrivate) {
      const friendship = await prisma.friendship.findFirst({
        where: {
          OR: [
            { userAId: user.id, userBId: targetUserId },
            { userAId: targetUserId, userBId: user.id },
          ],
        },
      });

      if (!friendship) {
        return NextResponse.json(
          {
            error:
              "This user is private. Send a friend request and wait for approval to start chatting.",
          },
          { status: 403 }
        );
      }
    }

    const newChat = await prisma.chat.create({
      data: {
        user1Id: user.id,
        user2Id: targetUserId,
        type: "direct",
      },
      include: chatInclude,
    });

    await createRealtimeNotification({
      userId: targetUserId,
      type: "CHAT",
      title: "New chat started",
      content: `${user.username} started a chat with you`,
      chatId: newChat.id,
    });

    const chatPayload = transformChat(newChat, 0);
    if (chatPayload) {
      emitToUser(targetUserId, "chat:new", { chat: chatPayload });
    }

    return NextResponse.json(
      { chat: transformChat(newChat, 0) },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating chat:", error);
    return NextResponse.json(
      { error: "Failed to create chat" },
      { status: 500 }
    );
  }
}

