"use client";

import { useState } from "react";
import { AlertTriangle, CheckCircle2, Loader2, ShieldOff, Trash2, VolumeX } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { FlaggedMessage } from "@/stores/useModerationStore";

type ActionType = "approve" | "warn" | "mute" | "delete";

interface ModeratorActionsProps {
  message?: FlaggedMessage | null;
  notes: string;
  onNotesChange: (value: string) => void;
  onAction: (action: ActionType, payload?: { duration?: string }) => Promise<void>;
  currentAction?: ActionType | null;
}

const muteDurations = ["15m", "1h", "8h", "24h", "7d"];

export default function ModeratorActions({
  message,
  notes,
  onNotesChange,
  onAction,
  currentAction,
}: ModeratorActionsProps) {
  const [duration, setDuration] = useState("1h");

  const disabled = !message;

  const handleAction = async (action: ActionType) => {
    await onAction(action, action === "mute" ? { duration } : undefined);
  };

  return (
    <section className="flex h-full flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Actions</p>
          <p className="text-lg font-bold text-slate-900">Moderator controls</p>
        </div>
        <span className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
          {message ? `Message #${message.messageId}` : "No selection"}
        </span>
      </div>

      <div className="grid gap-2">
        <Button
          disabled={disabled || currentAction === "approve"}
          onClick={() => handleAction("approve")}
          className="w-full justify-between rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 text-white shadow-lg shadow-emerald-500/25"
        >
          <span className="flex items-center gap-2">
            {currentAction === "approve" ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <CheckCircle2 className="h-4 w-4" />
            )}
            Approve (mark safe)
          </span>
          <span className="text-xs font-semibold">Shortcut ⌘ + A</span>
        </Button>

        <Button
          variant="outline"
          disabled={disabled || currentAction === "warn"}
          onClick={() => handleAction("warn")}
          className="w-full justify-between rounded-xl border-amber-200 bg-amber-50 text-amber-800 shadow-sm hover:border-amber-300 hover:bg-amber-100"
        >
          <span className="flex items-center gap-2">
            {currentAction === "warn" ? <Loader2 className="h-4 w-4 animate-spin" /> : <AlertTriangle className="h-4 w-4" />}
            Warn user
          </span>
          <span className="text-xs font-semibold">Soft intervention</span>
        </Button>

        <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 shadow-inner">
          <div className="flex items-center justify-between text-sm font-semibold text-slate-700">
            <div className="flex items-center gap-2">
              <VolumeX className="h-4 w-4 text-slate-600" />
              Mute duration
            </div>
            <span className="text-xs text-slate-500">Cooling-off</span>
          </div>
          <div className="mt-2 flex flex-wrap gap-2">
            {muteDurations.map((option) => (
              <button
                key={option}
                className={cn(
                  "rounded-full border px-3 py-1 text-xs font-semibold transition-all",
                  duration === option
                    ? "border-[#007AFF] bg-[#E8F1FF] text-[#0F172A]"
                    : "border-slate-200 bg-white text-slate-700 hover:border-slate-300"
                )}
                onClick={() => setDuration(option)}
              >
                {option}
              </button>
            ))}
          </div>
          <Button
            variant="outline"
            disabled={disabled || currentAction === "mute"}
            onClick={() => handleAction("mute")}
            className="mt-3 w-full justify-center rounded-lg border-slate-200 bg-white text-slate-800 hover:border-[#007AFF] hover:text-[#007AFF]"
          >
            {currentAction === "mute" ? <Loader2 className="h-4 w-4 animate-spin" /> : <VolumeX className="h-4 w-4" />}
            Mute user ({duration})
          </Button>
        </div>

        <Button
          variant="destructive"
          disabled={disabled || currentAction === "delete"}
          onClick={() => handleAction("delete")}
          className="w-full justify-center gap-2 rounded-xl bg-red-500 text-white shadow-sm shadow-red-400/40 hover:bg-red-600"
        >
          {currentAction === "delete" ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
          Delete message
        </Button>
      </div>

      <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 shadow-inner">
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
          <ShieldOff className="h-4 w-4 text-slate-600" />
          Audit notes
        </div>
        <textarea
          value={notes}
          disabled={!message}
          onChange={(event) => onNotesChange(event.target.value)}
          placeholder="Add moderator notes for audit trail..."
          className="mt-2 h-24 w-full resize-none rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 shadow-inner focus:border-[#007AFF] focus:outline-none"
        />
        <p className="mt-1 text-xs text-slate-500">Notes are saved with this decision.</p>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-3 text-xs text-slate-500 shadow-inner">
        <p className="font-semibold text-slate-700">Shortcuts</p>
        <div className="mt-1 grid grid-cols-2 gap-1">
          <span>Approve: ⌘ + A</span>
          <span>Warn: ⌘ + W</span>
          <span>Mute: ⌘ + M</span>
          <span>Delete: ⌘ + D</span>
        </div>
      </div>
    </section>
  );
}
