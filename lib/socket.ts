import type { Server as IOServer } from "socket.io";

type GlobalSocketStore = {
  io?: IOServer;
};

const globalForSocket = globalThis as unknown as GlobalSocketStore;

export const USER_ROOM_PREFIX = "user:";

export const getUserRoom = (userId: number) => `${USER_ROOM_PREFIX}${userId}`;

export const setSocketServer = (io: IOServer) => {
  globalForSocket.io = io;
};

export const getSocketServer = () => globalForSocket.io;

export const emitToUser = (userId: number, event: string, payload: unknown) => {
  const io = getSocketServer();
  if (!io) {
    return;
  }
  io.to(getUserRoom(userId)).emit(event, payload);
};

export const emitToUsers = (userIds: number[], event: string, payload: unknown) => {
  userIds.forEach((userId) => emitToUser(userId, event, payload));
};

export interface PresencePayload {
  userId: number;
  isOnline: boolean;
  lastSeen: string;
  visible: boolean;
}

export const emitPresenceUpdate = (payload: PresencePayload) => {
  const io = getSocketServer();
  io?.emit("presence:update", payload);
};
