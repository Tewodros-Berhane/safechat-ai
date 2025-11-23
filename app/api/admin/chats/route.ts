import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdminUser } from "@/lib/admin-auth";

export async function GET() {
  const admin = await requireAdminUser();
  if (!admin) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const chats = await prisma.chat.findMany({
      orderBy: { updatedAt: "desc" },
      take: 50,
      include: {
        messages: {
          orderBy: { createdAt: "desc" },
          take: 1,
          select: {
            id: true,
            messageText: true,
            isFlagged: true,
            createdAt: true,
          },
        },
        _count: { select: { messages: true } },
      },
    });

    return NextResponse.json(
      chats.map((chat) => ({
        id: chat.id,
        name: chat.name || chat.title,
        createdAt: chat.createdAt.toISOString(),
        messageCount: chat._count.messages,
        lastMessage: chat.messages[0]
          ? {
              id: chat.messages[0].id,
              messageText: chat.messages[0].messageText,
              isFlagged: chat.messages[0].isFlagged,
              createdAt: chat.messages[0].createdAt.toISOString(),
            }
          : null,
      }))
    );
  } catch (error) {
    console.error("Error fetching chats:", error);
    return NextResponse.json(
      { error: "Failed to fetch chats" },
      { status: 500 }
    );
  }
}
