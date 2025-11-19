import type { NextApiRequest } from "next";
import type { NextApiResponse } from "next";
import { Server as IOServer } from "socket.io";
import { prisma } from "@/lib/prisma";
import { emitPresenceUpdate, getUserRoom, setSocketServer } from "@/lib/socket";

export const config = {
  api: {
    bodyParser: false,
  },
};

type NextApiResponseServerIO = NextApiResponse & {
  socket: NextApiResponse["socket"] & {
    server: {
      io?: IOServer;
    };
  };
};

const globalPresence = globalThis as unknown as {
  presenceConnections?: Map<number, number>;
};

const presenceConnections =
  globalPresence.presenceConnections || new Map<number, number>();
globalPresence.presenceConnections = presenceConnections;

const incrementConnection = (userId: number) => {
  const count = presenceConnections.get(userId) || 0;
  const next = count + 1;
  presenceConnections.set(userId, next);
  return next;
};

const decrementConnection = (userId: number) => {
  const count = presenceConnections.get(userId) || 0;
  const next = Math.max(0, count - 1);
  if (next === 0) {
    presenceConnections.delete(userId);
  } else {
    presenceConnections.set(userId, next);
  }
  return next;
};

const updatePresence = async (userId: number, isOnline: boolean) => {
  try {
    const now = new Date();
    const user = await prisma.user.update({
      where: { id: userId },
      data: {
        isOnline,
        lastSeen: now,
      },
      select: {
        id: true,
        isPrivate: true,
        lastSeen: true,
      },
    });

    emitPresenceUpdate({
      userId: user.id,
      isOnline,
      lastSeen: user.lastSeen.toISOString(),
      visible: !user.isPrivate,
    });
  } catch (error) {
    console.error("Error updating presence:", error);
  }
};

const handler = (_req: NextApiRequest, res: NextApiResponseServerIO) => {
  if (!res.socket.server.io) {
    const io = new IOServer(res.socket.server, {
      path: "/api/socket",
    });

    setSocketServer(io);

    io.on("connection", (socket) => {
      const registerHandler = async (userId?: number) => {
        if (!userId || socket.data.userId === userId) return;
        socket.data.userId = userId;
        socket.join(getUserRoom(userId));

        const connectionCount = incrementConnection(userId);
        if (connectionCount === 1) {
          await updatePresence(userId, true);
        }
      };

      socket.on("register", registerHandler);
      socket.on("disconnect", async () => {
        const userId = socket.data.userId as number | undefined;
        if (userId) {
          socket.leave(getUserRoom(userId));
          const remaining = decrementConnection(userId);
          if (remaining === 0) {
            await updatePresence(userId, false);
          }
        }
      });
    });

    res.socket.server.io = io;
  }

  res.end();
};

export default handler;
