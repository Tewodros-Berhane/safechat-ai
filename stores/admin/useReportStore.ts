import { create } from "zustand";

export interface AdminReport {
  id: number;
  reporterId: number;
  chatId: number;
  message: string;
  status: "PENDING" | "REVIEWED" | "CLOSED";
  createdAt?: string;
}

interface ReportStore {
  reports: AdminReport[];
  loading: boolean;
  fetchReports: () => Promise<void>;
  updateReportStatus: (
    id: number,
    status: AdminReport["status"]
  ) => Promise<void>;
}

export const useReportStore = create<ReportStore>((set) => ({
  reports: [],
  loading: false,
  fetchReports: async () => {
    set({ loading: true });
    const res = await fetch("/api/admin/reports");
    if (!res.ok) {
      set({ loading: false });
      throw new Error("Failed to fetch reports");
    }
    const data = await res.json();
    set({ reports: data, loading: false });
  },
  updateReportStatus: async (id, status) => {
    await fetch(`/api/admin/reports/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    set((state) => ({
      reports: state.reports.map((r) =>
        r.id === id ? { ...r, status } : r
      ),
    }));
  },
}));
