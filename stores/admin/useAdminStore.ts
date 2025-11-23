import { create } from "zustand";

export interface AdminStats {
  totalUsers: number;
  activeUsers: number;
  flaggedMessages: number;
  totalChats: number;
  newReports: number;
  uptime: number;
}

interface AdminStore {
  stats: AdminStats | null;
  loading: boolean;
  fetchStats: () => Promise<void>;
}

export const useAdminStore = create<AdminStore>((set) => ({
  stats: null,
  loading: false,
  fetchStats: async () => {
    set({ loading: true });
    const res = await fetch("/api/admin/stats");
    if (!res.ok) {
      set({ loading: false });
      throw new Error("Failed to fetch stats");
    }
    const data = await res.json();
    set({ stats: data, loading: false });
  },
}));
