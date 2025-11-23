"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";

interface Moderator {
  id: number;
  fullName?: string | null;
  username: string;
  email: string;
  status: string;
  createdAt?: string;
}

export default function ModeratorsPage() {
  const [mods, setMods] = useState<Moderator[]>([]);
  const [form, setForm] = useState({ email: "", username: "", fullName: "" });

  const loadMods = async () => {
    const res = await fetch("/api/admin/moderators");
    if (res.ok) {
      const data = await res.json();
      setMods(data);
    }
  };

  useEffect(() => {
    loadMods();
  }, []);

  const handleCreate = async () => {
    const res = await fetch("/api/admin/moderators", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    if (res.ok) {
      setForm({ email: "", username: "", fullName: "" });
      loadMods();
    }
  };

  const handleRemove = async (id: number) => {
    await fetch(`/api/admin/moderators/${id}`, { method: "DELETE" });
    setMods((prev) => prev.filter((mod) => mod.id !== id));
  };

  return (
    <div className="space-y-4">
      <div>
        <p className="text-sm text-slate-500">Team</p>
        <h1 className="text-xl font-semibold text-slate-900">Moderators</h1>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white/80 p-4 shadow-sm space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <input
            value={form.fullName}
            onChange={(e) => setForm((f) => ({ ...f, fullName: e.target.value }))}
            placeholder="Full name"
            className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm"
          />
          <input
            value={form.username}
            onChange={(e) => setForm((f) => ({ ...f, username: e.target.value }))}
            placeholder="Username"
            className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm"
          />
          <input
            value={form.email}
            onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
            placeholder="Email"
            className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm"
          />
        </div>
        <Button className="w-full md:w-auto" onClick={handleCreate}>
          Add / Promote Moderator
        </Button>
      </div>

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white/80 shadow-sm">
        <div className="grid grid-cols-12 bg-slate-50 px-4 py-3 text-xs font-semibold uppercase text-slate-500">
          <div className="col-span-4">Moderator</div>
          <div className="col-span-4">Email</div>
          <div className="col-span-2">Status</div>
          <div className="col-span-2 text-right">Actions</div>
        </div>
        <div className="divide-y divide-slate-100">
          {mods.map((mod) => (
            <div key={mod.id} className="grid grid-cols-12 items-center px-4 py-3 text-sm hover:bg-slate-50">
              <div className="col-span-4">
                <p className="font-semibold">{mod.fullName || mod.username}</p>
                <p className="text-xs text-slate-500">Joined {mod.createdAt?.slice(0, 10)}</p>
              </div>
              <div className="col-span-4">{mod.email}</div>
              <div className="col-span-2 text-xs font-semibold text-emerald-600">{mod.status}</div>
              <div className="col-span-2 flex justify-end">
                <Button
                  variant="outline"
                  size="sm"
                  className="text-slate-700 border-slate-200 hover:border-slate-400"
                  onClick={() => handleRemove(mod.id)}
                >
                  Remove
                </Button>
              </div>
            </div>
          ))}
          {mods.length === 0 && (
            <div className="px-4 py-6 text-sm text-slate-500">No moderators yet. Add one above.</div>
          )}
        </div>
      </div>
    </div>
  );
}
