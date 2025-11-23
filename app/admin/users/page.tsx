"use client";

import { useEffect, useState } from "react";
import { useAdminUserStore, AdminUserRole, AdminUserStatus } from "@/stores/admin/useAdminUserStore";
import { Button } from "@/components/ui/button";

const roleOptions: AdminUserRole[] = ["USER", "MODERATOR", "ADMIN"];
const statusOptions: AdminUserStatus[] = ["ACTIVE", "SUSPENDED", "BANNED"];

export default function AdminUsersPage() {
  const { users, fetchUsers, updateUser, deleteUser } = useAdminUserStore();
  const [filter, setFilter] = useState<AdminUserRole | "all">("all");

  useEffect(() => {
    fetchUsers(filter === "all" ? undefined : filter);
  }, [fetchUsers, filter]);

  const handleRoleChange = async (id: number, role: AdminUserRole) => {
    await updateUser(id, { role });
  };

  const handleStatusChange = async (id: number, status: AdminUserStatus) => {
    await updateUser(id, { status });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-slate-500">Directory</p>
          <h1 className="text-xl font-semibold text-slate-900">Users & Moderators</h1>
        </div>
        <div className="flex items-center gap-2">
          <label className="text-sm text-slate-600">Filter</label>
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value as AdminUserRole | "all")}
            className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm"
          >
            <option value="all">All</option>
            {roleOptions.map((role) => (
              <option key={role} value={role}>
                {role}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white/80 shadow-sm">
        <div className="grid grid-cols-12 bg-slate-50 px-4 py-3 text-xs font-semibold uppercase text-slate-500">
          <div className="col-span-3">Name</div>
          <div className="col-span-3">Email</div>
          <div className="col-span-2">Role</div>
          <div className="col-span-2">Status</div>
          <div className="col-span-2 text-right">Actions</div>
        </div>
        <div className="divide-y divide-slate-100">
          {users.map((user) => (
            <div
              key={user.id}
              className="grid grid-cols-12 items-center px-4 py-3 text-sm text-slate-800 hover:bg-slate-50"
            >
              <div className="col-span-3">
                <p className="font-semibold">{user.fullName || user.username}</p>
                <p className="text-xs text-slate-500">Joined {user.createdAt?.slice(0, 10)}</p>
              </div>
              <div className="col-span-3">{user.email}</div>
              <div className="col-span-2">
                <select
                  className="w-full rounded-lg border border-slate-200 bg-white px-2 py-1 text-sm"
                  value={user.role}
                  onChange={(e) => handleRoleChange(user.id, e.target.value as AdminUserRole)}
                >
                  {roleOptions.map((role) => (
                    <option key={role} value={role}>
                      {role}
                    </option>
                  ))}
                </select>
              </div>
              <div className="col-span-2">
                <select
                  className="w-full rounded-lg border border-slate-200 bg-white px-2 py-1 text-sm"
                  value={user.status}
                  onChange={(e) => handleStatusChange(user.id, e.target.value as AdminUserStatus)}
                >
                  {statusOptions.map((status) => (
                    <option key={status} value={status}>
                      {status}
                    </option>
                  ))}
                </select>
              </div>
              <div className="col-span-2 flex justify-end">
                <Button
                  variant="outline"
                  size="sm"
                  className="text-red-600 border-red-200 hover:border-red-400 hover:text-red-700"
                  onClick={() => deleteUser(user.id)}
                >
                  Remove
                </Button>
              </div>
            </div>
          ))}
          {users.length === 0 && (
            <div className="px-4 py-6 text-sm text-slate-500">No users available yet.</div>
          )}
        </div>
      </div>
    </div>
  );
}
