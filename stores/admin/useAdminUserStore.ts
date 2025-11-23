import { create } from "zustand";
import { persist } from "zustand/middleware";

export type AdminUserRole = "USER" | "MODERATOR" | "ADMIN";
export type AdminUserStatus = "ACTIVE" | "SUSPENDED" | "BANNED";

export interface AdminUser {
  id: number;
  fullName?: string | null;
  username: string;
  email: string;
  role: AdminUserRole;
  status: AdminUserStatus;
  createdAt?: string;
}

interface AdminUserStore {
  users: AdminUser[];
  selectedUser: AdminUser | null;
  loading: boolean;
  fetchUsers: (role?: AdminUserRole) => Promise<void>;
  updateUser: (
    id: number,
    updates: Partial<Omit<AdminUser, "id">>
  ) => Promise<void>;
  deleteUser: (id: number) => Promise<void>;
  selectUser: (user: AdminUser | null) => void;
}

export const useAdminUserStore = create<AdminUserStore>()(
  persist(
    (set) => ({
      users: [],
      selectedUser: null,
      loading: false,
      fetchUsers: async (role) => {
        set({ loading: true });
        const query = role ? `?role=${role}` : "";
        const res = await fetch(`/api/admin/users${query}`);
        if (!res.ok) {
          set({ loading: false });
          throw new Error("Failed to fetch users");
        }
        const data = await res.json();
        set({ users: data, loading: false });
      },
      updateUser: async (id, updates) => {
        await fetch(`/api/admin/users/${id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(updates),
        });
        set((state) => ({
          users: state.users.map((u) =>
            u.id === id ? { ...u, ...updates } : u
          ),
        }));
      },
      deleteUser: async (id) => {
        await fetch(`/api/admin/users/${id}`, { method: "DELETE" });
        set((state) => ({
          users: state.users.filter((u) => u.id !== id),
        }));
      },
      selectUser: (user) => set({ selectedUser: user }),
    }),
    { name: "admin-user-store" }
  )
);
