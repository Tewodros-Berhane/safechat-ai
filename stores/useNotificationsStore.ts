import { create } from "zustand";

export type NotificationType =
  | "MESSAGE"
  | "CHAT"
  | "FLAGGED"
  | "MODERATION"
  | "SYSTEM"
  | "FRIEND_REQUEST"
  | "FRIEND_ACTIVITY";

export interface Notification {
  id: number;
  type: NotificationType;
  title: string | null;
  content: string | null;
  isRead: boolean;
  createdAt: string;
  chatId: number | null;
  messageId: number | null;
  chat?: {
    id: number;
    user1?: { id: number; username: string; profilePic: string | null };
    user2?: { id: number; username: string; profilePic: string | null };
  };
  message?: {
    id: number;
    user?: { id: number; username: string; profilePic: string | null };
  };
}

interface NotificationsState {
  notifications: Notification[];
  loading: boolean;
  error: string | null;

  // Actions
  setNotifications: (notifications: Notification[]) => void;
  addNotification: (notification: Notification) => void;
  updateNotification: (id: number, updates: Partial<Notification>) => void;
  removeNotification: (id: number) => void;
  markAsRead: (id: number) => void;
  markAllAsRead: () => void;

  // API calls
  fetchNotifications: () => Promise<void>;
  markNotificationAsRead: (id: number) => Promise<void>;
  markAllNotificationsAsRead: () => Promise<void>;
  deleteNotification: (id: number) => Promise<void>;

  // Utilities
  getUnreadCount: () => number;
  getRecentNotifications: (limit?: number) => Notification[];
  getUnreadNotifications: (limit?: number) => Notification[];
  clearAll: () => void;
}

export const useNotificationsStore = create<NotificationsState>((set, get) => ({
  notifications: [],
  loading: false,
  error: null,

  setNotifications: (notifications) => set({ notifications, error: null }),

  addNotification: (notification) =>
    set((state) => ({
      notifications: [notification, ...state.notifications],
    })),

  updateNotification: (id, updates) =>
    set((state) => ({
      notifications: state.notifications.map((notif) =>
        notif.id === id ? { ...notif, ...updates } : notif
      ),
    })),

  removeNotification: (id) =>
    set((state) => ({
      notifications: state.notifications.filter((notif) => notif.id !== id),
    })),

  markAsRead: (id) =>
    set((state) => ({
      notifications: state.notifications.map((notif) =>
        notif.id === id ? { ...notif, isRead: true } : notif
      ),
    })),

  markAllAsRead: () =>
    set((state) => ({
      notifications: state.notifications.map((notif) => ({ ...notif, isRead: true })),
    })),

  fetchNotifications: async () => {
    const { loading, notifications } = get();
    if (loading || notifications.length > 0) {
      return;
    }
    set({ loading: true, error: null });
    try {
      const response = await fetch("/api/notifications");
      if (!response.ok) {
        if (response.status === 401) {
          set({ notifications: [], loading: false, error: "Unauthorized" });
          return;
        }
        throw new Error("Failed to fetch notifications");
      }
      const data = await response.json();
      set({ notifications: data.notifications || [], loading: false, error: null });
    } catch (error) {
      console.error("Error fetching notifications:", error);
      set({
        loading: false,
        error: error instanceof Error ? error.message : "Failed to fetch notifications",
      });
    }
  },

  markNotificationAsRead: async (id) => {
    try {
      const response = await fetch(`/api/notifications/${id}`, {
        method: "PATCH",
      });

      if (!response.ok) {
        throw new Error("Failed to mark notification as read");
      }

      get().markAsRead(id);
    } catch (error) {
      console.error("Error marking notification as read:", error);
      set({
        error: error instanceof Error ? error.message : "Failed to mark notification as read",
      });
    }
  },

  markAllNotificationsAsRead: async () => {
    try {
      const response = await fetch("/api/notifications", {
        method: "POST",
      });

      if (!response.ok) {
        throw new Error("Failed to mark all notifications as read");
      }

      get().markAllAsRead();
    } catch (error) {
      console.error("Error marking all notifications as read:", error);
      set({
        error:
          error instanceof Error ? error.message : "Failed to mark all notifications as read",
      });
    }
  },

  deleteNotification: async (id) => {
    try {
      const response = await fetch(`/api/notifications/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete notification");
      }

      get().removeNotification(id);
    } catch (error) {
      console.error("Error deleting notification:", error);
      set({
        error: error instanceof Error ? error.message : "Failed to delete notification",
      });
    }
  },

  getUnreadCount: () => {
    return get().notifications.filter((notif) => !notif.isRead).length;
  },

  getRecentNotifications: (limit = 4) => {
    return get().notifications.slice(0, limit);
  },

  getUnreadNotifications: (limit = 3) => {
    return get()
      .notifications
      .filter((notif) => !notif.isRead)
      .slice(0, limit);
  },

  clearAll: () =>
    set({
      notifications: [],
      loading: false,
      error: null,
    }),
}));

