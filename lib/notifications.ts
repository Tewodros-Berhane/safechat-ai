import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { emitToUser } from "@/lib/socket";

const userSelection = {
  select: {
    id: true,
    username: true,
    profilePic: true,
    isPrivate: true,
    isOnline: true,
    lastSeen: true,
  },
};

export const notificationInclude = {
  chat: {
    include: {
      user1: userSelection,
      user2: userSelection,
    },
  },
  message: {
    include: {
      user: userSelection,
    },
  },
} satisfies Prisma.NotificationInclude;

export type NotificationWithRelations = Prisma.NotificationGetPayload<{
  include: typeof notificationInclude;
}>;

export async function createRealtimeNotification(
  data: Prisma.NotificationCreateArgs["data"]
) {
  const notification = await prisma.notification.create({
    data,
    include: notificationInclude,
  });
  const payload = JSON.parse(JSON.stringify(notification));
  emitToUser(notification.userId, "notification:new", { notification: payload });
  return notification;
}
