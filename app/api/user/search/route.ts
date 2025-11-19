import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../auth/[...nextauth]/route";
import { cookies } from "next/headers";
import { decode } from "next-auth/jwt";
import { prisma } from "@/lib/prisma";
import { FriendRequestStatus } from "@prisma/client";

const userSelect = {
  id: true,
  username: true,
  email: true,
  profilePic: true,
  isPrivate: true,
};

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

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const query = (searchParams.get("q") || "").trim();

    if (!query) {
      return NextResponse.json({ users: [] });
    }

    const [friendships, pendingRequests, users] = await Promise.all([
      prisma.friendship.findMany({
        where: {
          OR: [{ userAId: user.id }, { userBId: user.id }],
        },
      }),
      prisma.friendRequest.findMany({
        where: {
          status: FriendRequestStatus.PENDING,
          OR: [{ requesterId: user.id }, { receiverId: user.id }],
        },
      }),
      prisma.user.findMany({
        where: {
          AND: [
            {
              OR: [
                { username: { contains: query, mode: "insensitive" } },
                { email: { contains: query, mode: "insensitive" } },
              ],
            },
            { id: { not: user.id } },
          ],
        },
        select: userSelect,
        take: 10,
      }),
    ]);

    const friendIds = new Set<number>();
    friendships.forEach((friendship) => {
      friendIds.add(friendship.userAId === user.id ? friendship.userBId : friendship.userAId);
    });

    const outgoingRequests = new Set<number>();
    const incomingRequests = new Set<number>();
    pendingRequests.forEach((req) => {
      if (req.requesterId === user.id) {
        outgoingRequests.add(req.receiverId);
      } else {
        incomingRequests.add(req.requesterId);
      }
    });

    const enrichedUsers = users.map((candidate) => {
      let relationship: "FRIEND" | "OUTGOING_REQUEST" | "INCOMING_REQUEST" | "NONE" = "NONE";
      if (friendIds.has(candidate.id)) {
        relationship = "FRIEND";
      } else if (incomingRequests.has(candidate.id)) {
        relationship = "INCOMING_REQUEST";
      } else if (outgoingRequests.has(candidate.id)) {
        relationship = "OUTGOING_REQUEST";
      }

      return {
        ...candidate,
        relationship,
      };
    });

    return NextResponse.json({ users: enrichedUsers });
  } catch (error) {
    console.error("Error searching users:", error);
    return NextResponse.json(
      { error: "Failed to search users" },
      { status: 500 }
    );
  }
}
