import { create } from "zustand";

export interface Message {
  id: number;
  chatId: number;
  userId: number;
  messageText: string;
  toxicityScore: number | null;
  toxicityCategory: string | null;
  emotion: string | null;
  isFlagged: boolean;
  createdAt: string;
  user?: {
    id: number;
    username: string;
    profilePic: string | null;
  };
}

export interface Chat {
  id: number;
  user1Id: number;
  user2Id: number;
  type: string;
  title: string | null;
  createdAt: string;
  updatedAt: string;
  user1?: {
    id: number;
    username: string;
    profilePic: string | null;
  };
  user2?: {
    id: number;
    username: string;
    profilePic: string | null;
  };
  lastMessage?: Message;
  unreadCount?: number;
}

interface ChatsState {
  chats: Chat[];
  messages: Record<number, Message[]>; // chatId -> messages
  selectedChatId: number | null;
  loading: boolean;
  messagesLoading: Record<number, boolean>; // chatId -> loading state
  error: string | null;
  
  // Actions
  setChats: (chats: Chat[]) => void;
  addChat: (chat: Chat) => void;
  updateChat: (chatId: number, updates: Partial<Chat>) => void;
  removeChat: (chatId: number) => void;
  setSelectedChat: (chatId: number | null) => void;
  
  // Messages
  setMessages: (chatId: number, messages: Message[]) => void;
  addMessage: (chatId: number, message: Message) => void;
  updateMessage: (chatId: number, messageId: number, updates: Partial<Message>) => void;
  clearMessages: (chatId: number) => void;
  
  // API calls
  fetchChats: () => Promise<void>;
  fetchMessages: (chatId: number) => Promise<void>;
  sendMessage: (chatId: number, messageText: string) => Promise<Message | null>;
  
  // Utilities
  getChatById: (chatId: number) => Chat | undefined;
  getOtherUser: (chat: Chat, currentUserId: number) => { id: number; username: string; profilePic: string | null } | null;
  clearAll: () => void;
}

export const useChatsStore = create<ChatsState>((set, get) => ({
  chats: [],
  messages: {},
  selectedChatId: null,
  loading: false,
  messagesLoading: {},
  error: null,

  setChats: (chats) => set({ chats, error: null }),

  addChat: (chat) =>
    set((state) => ({
      chats: [...state.chats, chat],
    })),

  updateChat: (chatId, updates) =>
    set((state) => ({
      chats: state.chats.map((chat) =>
        chat.id === chatId ? { ...chat, ...updates } : chat
      ),
    })),

  removeChat: (chatId) =>
    set((state) => ({
      chats: state.chats.filter((chat) => chat.id !== chatId),
      messages: Object.fromEntries(
        Object.entries(state.messages).filter(([id]) => Number(id) !== chatId)
      ),
    })),

  setSelectedChat: (chatId) => set({ selectedChatId: chatId }),

  setMessages: (chatId, messages) =>
    set((state) => ({
      messages: { ...state.messages, [chatId]: messages },
      messagesLoading: { ...state.messagesLoading, [chatId]: false },
    })),

  addMessage: (chatId, message) =>
    set((state) => ({
      messages: {
        ...state.messages,
        [chatId]: [...(state.messages[chatId] || []), message],
      },
      // Update chat's last message
      chats: state.chats.map((chat) =>
        chat.id === chatId
          ? { ...chat, lastMessage: message, updatedAt: message.createdAt }
          : chat
      ),
    })),

  updateMessage: (chatId, messageId, updates) =>
    set((state) => ({
      messages: {
        ...state.messages,
        [chatId]: (state.messages[chatId] || []).map((msg) =>
          msg.id === messageId ? { ...msg, ...updates } : msg
        ),
      },
    })),

  clearMessages: (chatId) =>
    set((state) => {
      const newMessages = { ...state.messages };
      delete newMessages[chatId];
      return { messages: newMessages };
    }),

  fetchChats: async () => {
    const { loading, chats } = get();
    if (loading || chats.length > 0) {
      return;
    }
    set({ loading: true, error: null });
    try {
      const response = await fetch("/api/chats");
      if (!response.ok) {
        throw new Error("Failed to fetch chats");
      }
      const data = await response.json();
      set({ chats: data.chats, loading: false, error: null });
    } catch (error) {
      console.error("Error fetching chats:", error);
      set({
        loading: false,
        error: error instanceof Error ? error.message : "Failed to fetch chats",
      });
    }
  },

  fetchMessages: async (chatId) => {
    set((state) => ({
      messagesLoading: { ...state.messagesLoading, [chatId]: true },
    }));
    try {
      const response = await fetch(`/api/chats/${chatId}/messages`);
      if (!response.ok) {
        throw new Error("Failed to fetch messages");
      }
      const data = await response.json();
      get().setMessages(chatId, data.messages);
    } catch (error) {
      console.error("Error fetching messages:", error);
      set((state) => ({
        messagesLoading: { ...state.messagesLoading, [chatId]: false },
        error: error instanceof Error ? error.message : "Failed to fetch messages",
      }));
    }
  },

  sendMessage: async (chatId, messageText) => {
    try {
      const response = await fetch(`/api/chats/${chatId}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messageText }),
      });

      if (!response.ok) {
        throw new Error("Failed to send message");
      }

      const data = await response.json();
      const newMessage = data.message;
      get().addMessage(chatId, newMessage);
      return newMessage;
    } catch (error) {
      console.error("Error sending message:", error);
      set({
        error: error instanceof Error ? error.message : "Failed to send message",
      });
      return null;
    }
  },

  getChatById: (chatId) => {
    return get().chats.find((chat) => chat.id === chatId);
  },

  getOtherUser: (chat, currentUserId) => {
    if (chat.user1?.id === currentUserId) {
      return chat.user2 || null;
    }
    return chat.user1 || null;
  },

  clearAll: () =>
    set({
      chats: [],
      messages: {},
      selectedChatId: null,
      loading: false,
      messagesLoading: {},
      error: null,
    }),
}));

