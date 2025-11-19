import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]/route";
import { cookies } from "next/headers";
import { decode } from "next-auth/jwt";
import { prisma } from "@/lib/prisma";
import { createRealtimeNotification } from "@/lib/notifications";
import { FriendRequestStatus } from "@prisma/client";

const userSelect = {
  id: true,
  username: true,
  profilePic: true,
  isPrivate: true,
  isOnline: true,
  lastSeen: true,
};

type FriendUserPayload = Record<string, unknown> & {
  lastSeen: Date | null;
};

type SerializedFriendUser = Record<string, unknown> & {
  lastSeen: string | null;
};

const serializeFriendUser = (
  user?: FriendUserPayload | null
): SerializedFriendUser | undefined =>
  user
    ? ({
        ...user,
        lastSeen: user.lastSeen ? user.lastSeen.toISOString() : null,
      } as SerializedFriendUser)
    : undefined;

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

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
  });

  return user;
}

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const friendships = await prisma.friendship.findMany({
      where: {
        OR: [{ userAId: user.id }, { userBId: user.id }],
      },
      include: {
        userA: { select: userSelect },
        userB: { select: userSelect },
      },
      orderBy: { createdAt: "desc" },
    });

  const friends = friendships.map((friendship) => {
    const isUserA = friendship.userAId === user.id;
    const otherUser = isUserA ? friendship.userB : friendship.userA;
    return {
      id: otherUser.id,
      username: otherUser.username,
      profilePic: otherUser.profilePic,
      isPrivate: otherUser.isPrivate,
      isOnline: otherUser.isOnline,
      lastSeen: otherUser.lastSeen ? otherUser.lastSeen.toISOString() : null,
      friendSince: friendship.createdAt.toISOString(),
      friendshipId: friendship.id,
    };
  });

    const incomingRequests = await prisma.friendRequest.findMany({
      where: {
        receiverId: user.id,
        status: FriendRequestStatus.PENDING,
      },
      include: {
        requester: { select: userSelect },
      },
      orderBy: { createdAt: "asc" },
    });

    const outgoingRequests = await prisma.friendRequest.findMany({
      where: {
        requesterId: user.id,
        status: FriendRequestStatus.PENDING,
      },
      include: {
        receiver: { select: userSelect },
      },
      orderBy: { createdAt: "asc" },
    });

    return NextResponse.json({
      friends,
      requests: {
        incoming: incomingRequests.map((req) => ({
          id: req.id,
          status: req.status,
          createdAt: req.createdAt.toISOString(),
          requester: serializeFriendUser(req.requester),
        })),
        outgoing: outgoingRequests.map((req) => ({
          id: req.id,
          status: req.status,
          createdAt: req.createdAt.toISOString(),
          receiver: serializeFriendUser(req.receiver),
        })),
      },
    });
  } catch (error) {
    console.error("Error fetching friends data:", error);
    return NextResponse.json(
      { error: "Failed to fetch friends data" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
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
        { error: "You cannot send a friend request to yourself" },
        { status: 400 }
      );
    }

    const targetUser = await prisma.user.findUnique({
      where: { id: targetUserId },
      select: userSelect,
    });

    if (!targetUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const existingFriendship = await prisma.friendship.findFirst({
      where: {
        OR: [
          { userAId: user.id, userBId: targetUserId },
          { userAId: targetUserId, userBId: user.id },
        ],
      },
    });

    if (existingFriendship) {
      return NextResponse.json(
        { error: "You are already friends" },
        { status: 400 }
      );
    }

    const existingRequest = await prisma.friendRequest.findFirst({
      where: {
        OR: [
          { requesterId: user.id, receiverId: targetUserId },
          { requesterId: targetUserId, receiverId: user.id },
        ],
      },
    });

    if (existingRequest) {
      if (existingRequest.status === FriendRequestStatus.PENDING) {
        if (existingRequest.requesterId === user.id) {
          return NextResponse.json(
            { error: "Friend request already sent" },
            { status: 400 }
          );
        }

        return NextResponse.json(
          { error: "You already have a pending request from this user" },
          { status: 400 }
        );
      }

      const updatedRequest = await prisma.friendRequest.update({
        where: { id: existingRequest.id },
        data: {
          requesterId: user.id,
          receiverId: targetUserId,
          status: FriendRequestStatus.PENDING,
          createdAt: new Date(),
        },
        include: {
          requester: { select: userSelect },
          receiver: { select: userSelect },
        },
      });

      await createRealtimeNotification({
        userId: targetUserId,
        type: "FRIEND_REQUEST",
        title: "New friend request",
        content: `${user.username} sent you a friend request`,
      });

      return NextResponse.json({ request: updatedRequest }, { status: 201 });
    }

    const friendRequest = await prisma.friendRequest.create({
      data: {
        requesterId: user.id,
        receiverId: targetUserId,
      },
      include: {
        requester: { select: userSelect },
        receiver: { select: userSelect },
      },
    });

    await createRealtimeNotification({
      userId: targetUserId,
      type: "FRIEND_REQUEST",
      title: "New friend request",
      content: `${user.username} sent you a friend request`,
    });

    return NextResponse.json({ request: friendRequest }, { status: 201 });
  } catch (error) {
    console.error("Error sending friend request:", error);
    return NextResponse.json(
      { error: "Failed to send friend request" },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json().catch(() => null);
    const requestId = Number(body?.requestId);
    const action = String(body?.action || "").toUpperCase();

    if (!requestId || Number.isNaN(requestId)) {
      return NextResponse.json(
        { error: "requestId is required" },
        { status: 400 }
      );
    }

    if (!["ACCEPT", "REJECT"].includes(action)) {
      return NextResponse.json(
        { error: "Action must be ACCEPT or REJECT" },
        { status: 400 }
      );
    }

    const friendRequest = await prisma.friendRequest.findUnique({
      where: { id: requestId },
      include: {
        requester: { select: userSelect },
        receiver: { select: userSelect },
      },
    });

    if (!friendRequest || friendRequest.receiverId !== user.id) {
      return NextResponse.json(
        { error: "Friend request not found" },
        { status: 404 }
      );
    }

    if (friendRequest.status !== FriendRequestStatus.PENDING) {
      return NextResponse.json(
        { error: "This request has already been processed" },
        { status: 400 }
      );
    }

    if (action === "ACCEPT") {
      await prisma.friendRequest.update({
        where: { id: friendRequest.id },
        data: { status: FriendRequestStatus.ACCEPTED },
      });

      const [userAId, userBId] =
        friendRequest.requesterId < friendRequest.receiverId
          ? [friendRequest.requesterId, friendRequest.receiverId]
          : [friendRequest.receiverId, friendRequest.requesterId];

      await prisma.friendship.upsert({
        where: {
          userAId_userBId: { userAId, userBId },
        },
        update: {},
        create: {
          userAId,
          userBId,
        },
      });

      await createRealtimeNotification({
        userId: friendRequest.requesterId,
        type: "FRIEND_ACTIVITY",
        title: "Friend request accepted",
        content: `${user.username} accepted your friend request`,
      });

      return NextResponse.json({
        status: "accepted",
        friend: {
          id: friendRequest.requester.id,
          username: friendRequest.requester.username,
          profilePic: friendRequest.requester.profilePic,
          isPrivate: friendRequest.requester.isPrivate,
        },
      });
    }

    await prisma.friendRequest.update({
      where: { id: friendRequest.id },
      data: { status: FriendRequestStatus.REJECTED },
    });

    await createRealtimeNotification({
      userId: friendRequest.requesterId,
      type: "FRIEND_ACTIVITY",
      title: "Friend request declined",
      content: `${user.username} declined your friend request`,
    });

    return NextResponse.json({ status: "rejected" });
  } catch (error) {
    console.error("Error updating friend request:", error);
    return NextResponse.json(
      { error: "Failed to update friend request" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json().catch(() => null);
    const friendUserId = Number(body?.userId);

    if (!friendUserId || Number.isNaN(friendUserId)) {
      return NextResponse.json(
        { error: "userId is required" },
        { status: 400 }
      );
    }

    const friendship = await prisma.friendship.findFirst({
      where: {
        OR: [
          { userAId: user.id, userBId: friendUserId },
          { userAId: friendUserId, userBId: user.id },
        ],
      },
    });

    if (!friendship) {
      return NextResponse.json(
        { error: "Friendship not found" },
        { status: 404 }
      );
    }

    await prisma.friendship.delete({ where: { id: friendship.id } });

    await createRealtimeNotification({
      userId: friendUserId,
      type: "FRIEND_ACTIVITY",
      title: "Friend removed",
      content: `${user.username} removed you from their friends list`,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error removing friend:", error);
    return NextResponse.json(
      { error: "Failed to remove friend" },
      { status: 500 }
    );
  }
}
