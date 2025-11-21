import { create } from "zustand";

export type ModerationCategory =
  | "harassment"
  | "spam"
  | "toxicity"
  | "self-harm"
  | "hate-speech"
  | "other";

export type ModerationStatus = "pending" | "reviewed";

export interface ConversationMessage {
  sender: string;
  text: string;
  timestamp: string;
  isFlagged?: boolean;
}

export interface FlaggedMessage {
  chatId: number;
  messageId: number;
  sender: string;
  senderId?: number;
  text: string;
  score: number;
  category: ModerationCategory;
  timestamp: string;
  status: ModerationStatus;
  origin?: "ai" | "user-report";
  aiSummary?: string;
  notes?: string;
  context?: ConversationMessage[];
}

interface Filters {
  category: ModerationCategory | "all";
  status: ModerationStatus | "all";
  search: string;
}

interface ModerationState {
  flaggedMessages: FlaggedMessage[];
  selectedMessageId: number | null;
  filters: Filters;

  addFlaggedMessage: (message: Omit<FlaggedMessage, "status"> & Partial<Pick<FlaggedMessage, "status">>) => void;
  selectMessage: (messageId: number | null) => void;
  markMessageStatus: (messageId: number, status: ModerationStatus) => void;
  updateNotes: (messageId: number, notes: string) => void;
  setContext: (messageId: number, context: ConversationMessage[]) => void;
  setCategoryFilter: (category: Filters["category"]) => void;
  setStatusFilter: (status: Filters["status"]) => void;
  setSearch: (search: string) => void;
  clearQueue: () => void;

  getFilteredMessages: () => FlaggedMessage[];
  getStats: () => { total: number; pending: number; reviewed: number };
}

const sampleMessages: FlaggedMessage[] = [
  {
    chatId: 42,
    messageId: 1337,
    sender: "user@example.com",
    senderId: 7,
    text: "this is an offensive message",
    score: 0.92,
    category: "harassment",
    timestamp: "2025-11-21T12:30:00Z",
    status: "pending",
    origin: "ai",
    aiSummary: "Detected harassment and personal attack directed at another user.",
    context: [
      {
        sender: "coach@safechat.ai",
        text: "Let's keep the chat respectful and on-topic.",
        timestamp: "2025-11-21T12:28:00Z",
      },
      {
        sender: "user@example.com",
        text: "Sure, but they started it.",
        timestamp: "2025-11-21T12:29:10Z",
      },
      {
        sender: "user@example.com",
        text: "this is an offensive message",
        timestamp: "2025-11-21T12:30:00Z",
        isFlagged: true,
      },
    ],
  },
  {
    chatId: 56,
    messageId: 2048,
    sender: "support@acme.co",
    senderId: 12,
    text: "Claiming all the prizes here, no one else should join this giveaway.",
    score: 0.81,
    category: "spam",
    timestamp: "2025-11-21T12:31:20Z",
    status: "pending",
    origin: "user-report",
    aiSummary: "Likely spam or self-promotion inside a public support space.",
    context: [
      {
        sender: "member@acme.co",
        text: "Anyone else getting these promo links?",
        timestamp: "2025-11-21T12:30:10Z",
      },
    ],
  },
  {
    chatId: 72,
    messageId: 4096,
    sender: "anon@forum.net",
    senderId: 33,
    text: "maybe you should harm yourself",
    score: 0.96,
    category: "self-harm",
    timestamp: "2025-11-21T12:32:45Z",
    status: "pending",
    origin: "ai",
    aiSummary: "Encouraging self-harm; urgent human review recommended.",
  },
];

const normalizeMessage = (message: Omit<FlaggedMessage, "status"> & Partial<Pick<FlaggedMessage, "status">>) => ({
  ...message,
  status: message.status ?? "pending",
  notes: message.notes ?? "",
});

export const useModerationStore = create<ModerationState>((set, get) => ({
  flaggedMessages: sampleMessages,
  selectedMessageId: sampleMessages[0]?.messageId ?? null,
  filters: {
    category: "all",
    status: "pending",
    search: "",
  },

  addFlaggedMessage: (message) =>
    set((state) => {
      const normalized = normalizeMessage(message);
      const existingIndex = state.flaggedMessages.findIndex((item) => item.messageId === normalized.messageId);
      let updated = [...state.flaggedMessages];

      if (existingIndex >= 0) {
        updated[existingIndex] = { ...updated[existingIndex], ...normalized };
      } else {
        updated = [normalized, ...updated];
      }

      updated.sort((a, b) => new Date(b.timestamp).valueOf() - new Date(a.timestamp).valueOf());

      return {
        flaggedMessages: updated,
        selectedMessageId: state.selectedMessageId ?? normalized.messageId,
      };
    }),

  selectMessage: (messageId) => set({ selectedMessageId: messageId }),

  markMessageStatus: (messageId, status) =>
    set((state) => ({
      flaggedMessages: state.flaggedMessages.map((message) =>
        message.messageId === messageId ? { ...message, status } : message
      ),
    })),

  updateNotes: (messageId, notes) =>
    set((state) => ({
      flaggedMessages: state.flaggedMessages.map((message) =>
        message.messageId === messageId ? { ...message, notes } : message
      ),
    })),

  setContext: (messageId, context) =>
    set((state) => ({
      flaggedMessages: state.flaggedMessages.map((message) =>
        message.messageId === messageId ? { ...message, context } : message
      ),
    })),

  setCategoryFilter: (category) => set((state) => ({ filters: { ...state.filters, category } })),
  setStatusFilter: (status) => set((state) => ({ filters: { ...state.filters, status } })),
  setSearch: (search) => set((state) => ({ filters: { ...state.filters, search } })),

  clearQueue: () => set({ flaggedMessages: [], selectedMessageId: null }),

  getFilteredMessages: () => {
    const { flaggedMessages, filters } = get();
    const search = filters.search.toLowerCase().trim();

    return flaggedMessages.filter((message) => {
      const matchesCategory = filters.category === "all" || message.category === filters.category;
      const matchesStatus = filters.status === "all" || message.status === filters.status;
      const matchesSearch =
        !search ||
        message.sender.toLowerCase().includes(search) ||
        message.text.toLowerCase().includes(search) ||
        String(message.chatId).includes(search);

      return matchesCategory && matchesStatus && matchesSearch;
    });
  },

  getStats: () => {
    const { flaggedMessages } = get();
    const total = flaggedMessages.length;
    const pending = flaggedMessages.filter((message) => message.status === "pending").length;
    const reviewed = total - pending;
    return { total, pending, reviewed };
  },
}));
