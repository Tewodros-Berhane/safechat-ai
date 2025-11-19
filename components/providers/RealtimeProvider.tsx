"use client";

import { useEffect } from "react";
import { io, Socket } from "socket.io-client";
import { useUserStore } from "@/stores/useUserStore";
import { useChatsStore, type Chat, type Message } from "@/stores/useChatsStore";
import {
  useNotificationsStore,
  type Notification as NotificationItem,
} from "@/stores/useNotificationsStore";
import { useFriendsStore } from "@/stores/useFriendsStore";

interface MessageEventPayload {
  chatId: number;
  message: Message;
  chatPreview?: Chat;
}

interface MessageReadPayload {
  chatId: number;
  receipts: { messageId: number; userId: number; readAt: string }[];
}

interface NotificationEventPayload {
  notification: NotificationItem;
}

interface ChatEventPayload {
  chat: Chat;
}

interface PresencePayload {
  userId: number;
  isOnline: boolean;
  lastSeen: string;
  visible: boolean;
}

let socket: Socket | null = null;

const getSocket = () => {
  if (!socket) {
    socket = io({
      path: "/api/socket",
      transports: ["websocket"],
    });
  }
  return socket;
};

export default function RealtimeProvider() {
  const user = useUserStore((state) => state.user);

  useEffect(() => {
    fetch("/api/socket").catch(() => {});
  }, []);

  useEffect(() => {
    if (!user?.id) {
      if (socket) {
        socket.disconnect();
        socket = null;
      }
      return;
    }

    const socketInstance = getSocket();
    if (socketInstance.disconnected) {
      socketInstance.connect();
    }
    socketInstance.emit("register", user.id);

    const markMessagesAsRead = async (chatId: number, messageIds: number[]) => {
      try {
        const response = await fetch(`/api/chats/${chatId}/messages/read`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ messageIds }),
        });
        if (!response.ok) {
          return;
        }
        const data = await response.json();
        const { updateMessage } = useChatsStore.getState();
        data.receipts?.forEach((receipt: MessageReadPayload["receipts"][number]) => {
          const msgs = useChatsStore.getState().messages[chatId] || [];
          const target = msgs.find((msg) => msg.id === receipt.messageId);
          const existing = target?.readReceipts || [];
          if (target && !existing.some((r) => r.userId === receipt.userId)) {
            updateMessage(chatId, receipt.messageId, {
              readReceipts: [...existing, { userId: receipt.userId, readAt: receipt.readAt }],
            });
          }
        });
      } catch {
        // Silently ignore read errors
      }
    };

    const handleMessage = (payload: MessageEventPayload) => {
      const chatsStore = useChatsStore.getState();
      const { getChatById, addChat, addMessage, updateChat, selectedChatId } = chatsStore;

      const existingChat = getChatById(payload.chatId);
      const baseChat = payload.chatPreview || existingChat;
      if (baseChat) {
        addChat({
          ...baseChat,
          lastMessage: payload.message,
          updatedAt: payload.message.createdAt,
        });
      }

      addMessage(payload.chatId, payload.message);

      if (user && selectedChatId === payload.chatId && payload.message.userId !== user.id) {
        markMessagesAsRead(payload.chatId, [payload.message.id]);
      } else {
        const currentUnread = existingChat?.unreadCount || 0;
        updateChat(payload.chatId, {
          unreadCount: currentUnread + 1,
        });
      }
    };

    const handleMessageRead = (payload: MessageReadPayload) => {
      const state = useChatsStore.getState();
      const { messages, updateMessage, getChatById, updateChat } = state;

      payload.receipts.forEach((receipt) => {
        const chatMessages = messages[payload.chatId] || [];
        const target = chatMessages.find((msg) => msg.id === receipt.messageId);
        if (!target) {
          return;
        }
        const existingReceipts = target.readReceipts || [];
        if (existingReceipts.some((r) => r.userId === receipt.userId)) {
          return;
        }
        updateMessage(payload.chatId, receipt.messageId, {
          readReceipts: [...existingReceipts, { userId: receipt.userId, readAt: receipt.readAt }],
        });
      });

      const chat = getChatById(payload.chatId);
      if (chat?.lastMessage) {
        const receiptHit = payload.receipts.find(
          (receipt) => receipt.messageId === chat.lastMessage?.id
        );
        if (receiptHit) {
          const existing = chat.lastMessage.readReceipts || [];
          if (!existing.some((r) => r.userId === receiptHit.userId)) {
            updateChat(payload.chatId, {
              lastMessage: {
                ...chat.lastMessage,
                readReceipts: [...existing, { userId: receiptHit.userId, readAt: receiptHit.readAt }],
              },
            });
          }
        }
      }
    };

    const handleNotification = (payload: NotificationEventPayload) => {
      const { addNotification } = useNotificationsStore.getState();
      addNotification(payload.notification);
    };

    const handleNewChat = (payload: ChatEventPayload) => {
      const { addChat } = useChatsStore.getState();
      addChat({
        ...payload.chat,
        unreadCount: payload.chat.unreadCount ?? 0,
      });
    };

    const handlePresence = (payload: PresencePayload) => {
      const { updateUserPresence } = useChatsStore.getState();
      updateUserPresence(payload.userId, {
        isOnline: payload.isOnline,
        lastSeen: payload.lastSeen,
      });

      useFriendsStore.getState().updatePresence(payload.userId, {
        isOnline: payload.isOnline,
        lastSeen: payload.lastSeen,
      });

      if (user && payload.userId === user.id) {
        useUserStore.getState().updateUser({
          isOnline: payload.isOnline,
          lastSeen: payload.lastSeen,
        });
      }
    };

    socketInstance.on("message:new", handleMessage);
    socketInstance.on("message:read", handleMessageRead);
    socketInstance.on("notification:new", handleNotification);
    socketInstance.on("chat:new", handleNewChat);
    socketInstance.on("presence:update", handlePresence);

    return () => {
      socketInstance.off("message:new", handleMessage);
      socketInstance.off("message:read", handleMessageRead);
      socketInstance.off("notification:new", handleNotification);
      socketInstance.off("chat:new", handleNewChat);
      socketInstance.off("presence:update", handlePresence);
    };
  }, [user]);

  return null;
}
