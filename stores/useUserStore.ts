import { create } from "zustand";

export type UserRole = "USER" | "MODERATOR" | "ADMIN";

export interface User {
  id: number;
  username: string;
  email: string;
  age: number | null;
  role: UserRole;
  profilePic: string | null;
  createdAt: string;
  updatedAt: string;
  chatCount?: number;
}

interface UserState {
  user: User | null;
  loading: boolean;
  error: string | null;
  setUser: (user: User) => void;
  updateUser: (updates: Partial<User>) => void;
  clearUser: () => void;
  fetchUser: () => Promise<void>;
}

export const useUserStore = create<UserState>((set, get) => ({
  user: null,
  loading: false,
  error: null,

  setUser: (user) => set({ user, error: null }),

  updateUser: (updates) =>
    set((state) => ({
      user: state.user ? { ...state.user, ...updates } : null,
    })),

  clearUser: () => set({ user: null, error: null }),

  fetchUser: async () => {
    const { loading, user } = get();
    if (loading || user) {
      return;
    }
    set({ loading: true, error: null });
    try {
      const response = await fetch("/api/user");
      if (!response.ok) {
        if (response.status === 401) {
          set({ user: null, loading: false, error: "Unauthorized" });
          return;
        }
        throw new Error("Failed to fetch user");
      }
      const data = await response.json();
      set({ user: data.user, loading: false, error: null });
    } catch (error) {
      console.error("Error fetching user:", error);
      set({
        loading: false,
        error: error instanceof Error ? error.message : "Failed to fetch user",
      });
    }
  },
}));

