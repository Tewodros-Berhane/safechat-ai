import { create } from "zustand";

export interface AdminAIModel {
  id: number;
  name: string;
  endpoint: string;
  status: "ACTIVE" | "DISABLED";
  threshold: number;
  lastUpdated: string;
}

interface ModelStore {
  models: AdminAIModel[];
  loading: boolean;
  fetchModels: () => Promise<void>;
  updateModel: (
    id: number,
    updates: Partial<Omit<AdminAIModel, "id">>
  ) => Promise<void>;
  createModel: (
    model: Pick<AdminAIModel, "name" | "endpoint"> &
      Partial<Omit<AdminAIModel, "id" | "name" | "endpoint">>
  ) => Promise<void>;
}

export const useModelStore = create<ModelStore>((set) => ({
  models: [],
  loading: false,
  fetchModels: async () => {
    set({ loading: true });
    const res = await fetch("/api/admin/models");
    if (!res.ok) {
      set({ loading: false });
      throw new Error("Failed to fetch models");
    }
    const data = await res.json();
    set({ models: data, loading: false });
  },
  updateModel: async (id, updates) => {
    await fetch(`/api/admin/models/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updates),
    });
    set((state) => ({
      models: state.models.map((m) =>
        m.id === id ? { ...m, ...updates, lastUpdated: new Date().toISOString() } : m
      ),
    }));
  },
  createModel: async (model) => {
    const res = await fetch("/api/admin/models", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(model),
    });
    if (!res.ok) {
      throw new Error("Failed to create model");
    }
    const created = await res.json();
    set((state) => ({ models: [created, ...state.models] }));
  },
}));
