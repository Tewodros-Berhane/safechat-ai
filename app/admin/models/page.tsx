"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { useModelStore } from "@/stores/admin/useModelStore";

export default function ModelsPage() {
  const { models, fetchModels, updateModel, createModel } = useModelStore();
  const [draft, setDraft] = useState({ name: "", endpoint: "", threshold: 0.85 });

  useEffect(() => {
    fetchModels();
  }, [fetchModels]);

  const handleSave = async () => {
    await createModel(draft);
    setDraft({ name: "", endpoint: "", threshold: 0.85 });
  };

  return (
    <div className="space-y-4">
      <div>
        <p className="text-sm text-slate-500">Model Ops</p>
        <h1 className="text-xl font-semibold text-slate-900">AI Models</h1>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white/80 p-4 shadow-sm space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <input
            value={draft.name}
            onChange={(e) => setDraft((d) => ({ ...d, name: e.target.value }))}
            placeholder="Model name"
            className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm"
          />
          <input
            value={draft.endpoint}
            onChange={(e) => setDraft((d) => ({ ...d, endpoint: e.target.value }))}
            placeholder="Endpoint URL"
            className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm"
          />
          <div className="flex items-center gap-3">
            <label className="text-sm text-slate-600">Threshold</label>
            <input
              type="number"
              step="0.01"
              min="0"
              max="1"
              value={draft.threshold}
              onChange={(e) => setDraft((d) => ({ ...d, threshold: parseFloat(e.target.value) }))}
              className="w-24 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm"
            />
          </div>
        </div>
        <Button className="w-full md:w-auto" onClick={handleSave}>
          Add Model
        </Button>
      </div>

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white/80 shadow-sm">
        <div className="grid grid-cols-12 bg-slate-50 px-4 py-3 text-xs font-semibold uppercase text-slate-500">
          <div className="col-span-3">Model</div>
          <div className="col-span-4">Endpoint</div>
          <div className="col-span-2">Status</div>
          <div className="col-span-2">Threshold</div>
          <div className="col-span-1 text-right">Update</div>
        </div>
        <div className="divide-y divide-slate-100">
          {models.map((model) => (
            <div key={model.id} className="grid grid-cols-12 items-center px-4 py-3 text-sm hover:bg-slate-50">
              <div className="col-span-3">
                <p className="font-semibold">{model.name}</p>
                <p className="text-xs text-slate-500">Updated {model.lastUpdated.slice(0, 10)}</p>
              </div>
              <div className="col-span-4 truncate text-slate-700">{model.endpoint}</div>
              <div className="col-span-2">
                <select
                  className="w-full rounded-lg border border-slate-200 bg-white px-2 py-1 text-sm"
                  value={model.status}
                  onChange={(e) =>
                    updateModel(model.id, { status: e.target.value as "ACTIVE" | "DISABLED" })
                  }
                >
                  <option value="ACTIVE">ACTIVE</option>
                  <option value="DISABLED">DISABLED</option>
                </select>
              </div>
              <div className="col-span-2">
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  max="1"
                  value={model.threshold}
                  onChange={(e) =>
                    updateModel(model.id, { threshold: parseFloat(e.target.value) || model.threshold })
                  }
                  className="w-24 rounded-lg border border-slate-200 bg-white px-2 py-1 text-sm"
                />
              </div>
              <div className="col-span-1 text-right">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => updateModel(model.id, { lastUpdated: new Date().toISOString() })}
                >
                  Sync
                </Button>
              </div>
            </div>
          ))}
          {models.length === 0 && (
            <div className="px-4 py-6 text-sm text-slate-500">No models configured yet.</div>
          )}
        </div>
      </div>
    </div>
  );
}
