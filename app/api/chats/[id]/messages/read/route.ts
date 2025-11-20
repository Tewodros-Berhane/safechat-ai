import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../../../auth/[...nextauth]/route";
import { cookies } from "next/headers";
import { decode } from "next-auth/jwt";
import { prisma } from "@/lib/prisma";
import { emitToUser } from "@/lib/socket";

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

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> | { id: string } }
) {
  try {
    let session = await getServerSession(authOptions);
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

    const resolvedParams = await Promise.resolve(params);
    const chatId = parseInt(resolvedParams.id);

    const chat = await prisma.chat.findFirst({
      where: {
        id: chatId,
        OR: [{ user1Id: user.id }, { user2Id: user.id }],
      },
    });

    if (!chat) {
      return NextResponse.json(
        { error: "Chat not found or access denied" },
        { status: 404 }
      );
    }

    const body = await request.json().catch(() => null);
    const messageIds: number[] | undefined = Array.isArray(body?.messageIds)
      ? body.messageIds
          .map((id: unknown) => Number(id))
          .filter((id): id is number => !Number.isNaN(id))
      : undefined;

    const messages = await prisma.message.findMany({
      where: {
        chatId,
        userId: { not: user.id },
        ...(messageIds?.length ? { id: { in: messageIds } } : {}),
      },
      select: {
        id: true,
        readReceipts: {
          select: {
            userId: true,
          },
        },
      },
    });

    const unreadMessageIds = messages
      .filter((msg) => !msg.readReceipts.some((receipt) => receipt.userId === user.id))
      .map((msg) => msg.id);

    if (unreadMessageIds.length === 0) {
      return NextResponse.json({ receipts: [] });
    }

    const receiptData = unreadMessageIds.map((messageId) => ({
      messageId,
      userId: user.id,
      readAt: new Date(),
    }));

    await prisma.messageReadReceipt.createMany({
      data: receiptData,
      skipDuplicates: true,
    });

    const otherUserId = chat.user1Id === user.id ? chat.user2Id : chat.user1Id;
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

    return NextResponse.json({
      receipts: receiptData.map((receipt) => ({
        messageId: receipt.messageId,
        userId: receipt.userId,
        readAt: receipt.readAt.toISOString(),
      })),
    });
  } catch (error) {
    console.error("Error marking messages as read:", error);
    return NextResponse.json(
      { error: "Failed to mark messages as read" },
      { status: 500 }
    );
  }
}
