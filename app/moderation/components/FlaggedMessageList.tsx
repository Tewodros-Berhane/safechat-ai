"use client";

import { useMemo } from "react";
import { BadgeAlert, Filter, MessageCircleWarning, Shield } from "lucide-react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import type { FlaggedMessage, ModerationCategory, ModerationStatus } from "@/stores/useModerationStore";
import { Button } from "@/components/ui/button";

interface Filters {
  category: ModerationCategory | "all";
  status: ModerationStatus | "all";
  search: string;
}

interface FlaggedMessageListProps {
  messages: FlaggedMessage[];
  selectedMessageId: number | null;
  filters: Filters;
  onSelect: (messageId: number) => void;
  onChangeFilters: (filters: Partial<Filters>) => void;
}

const categoryStyles: Record<ModerationCategory, string> = {
  harassment: "bg-red-50 text-red-700 border-red-100",
  spam: "bg-amber-50 text-amber-700 border-amber-100",
  toxicity: "bg-purple-50 text-purple-700 border-purple-100",
  "self-harm": "bg-rose-50 text-rose-700 border-rose-100",
  "hate-speech": "bg-slate-800/5 text-slate-900 border-slate-200",
  other: "bg-slate-100 text-slate-700 border-slate-200",
};

const categoryLabels: Record<ModerationCategory, string> = {
  harassment: "Harassment",
  spam: "Spam",
  toxicity: "Toxic",
  "self-harm": "Self-harm",
  "hate-speech": "Hate",
  other: "Other",
};

const statusLabels: Record<ModerationStatus, string> = {
  pending: "Pending",
  reviewed: "Reviewed",
};

const formatTime = (timestamp: string) =>
  new Intl.DateTimeFormat("en", {
    hour: "2-digit",
    minute: "2-digit",
    month: "short",
    day: "2-digit",
  }).format(new Date(timestamp));

export default function FlaggedMessageList({
  messages,
  selectedMessageId,
  filters,
  onSelect,
  onChangeFilters,
}: FlaggedMessageListProps) {
  const categoryFilters = useMemo(
    () => [
      { label: "All", value: "all" as const },
      { label: "Harassment", value: "harassment" as const },
      { label: "Spam", value: "spam" as const },
      { label: "Toxic", value: "toxicity" as const },
      { label: "Self-harm", value: "self-harm" as const },
      { label: "Hate", value: "hate-speech" as const },
    ],
    []
  );

  const statusFilters = useMemo(
    () => [
      { label: "All", value: "all" as const },
      { label: statusLabels.pending, value: "pending" as const },
      { label: statusLabels.reviewed, value: "reviewed" as const },
    ],
    []
  );

  return (
    <section className="flex h-full flex-col gap-4">
      <div className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Live queue</p>
            <p className="text-lg font-bold text-slate-900">Flagged messages</p>
          </div>
          <span className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
            <Filter className="h-4 w-4" /> Filters
          </span>
        </div>

        <div className="grid grid-cols-2 gap-2 md:grid-cols-3">
          {categoryFilters.map((item) => (
            <button
              key={item.value}
              onClick={() => onChangeFilters({ category: item.value })}
              className={cn(
                "flex items-center justify-center rounded-xl border px-3 py-2 text-sm font-semibold transition-all",
                filters.category === item.value
                  ? "border-[#007AFF] bg-[#E8F1FF] text-[#0F172A]"
                  : "border-slate-200 bg-slate-50 text-slate-600 hover:border-slate-300 hover:bg-white"
              )}
            >
              {item.label}
            </button>
          ))}
        </div>

        <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <Input
            placeholder="Search by user, chat ID, or text"
            value={filters.search}
            onChange={(event) => onChangeFilters({ search: event.target.value })}
            className="h-10 border-slate-200 bg-slate-50 text-sm shadow-inner focus-visible:ring-[#007AFF]/50"
          />
          <div className="flex items-center gap-2">
            {statusFilters.map((item) => (
              <Button
                key={item.value}
                size="sm"
                variant={filters.status === item.value ? "default" : "outline"}
                className={cn(
                  "rounded-full px-3 text-xs font-semibold",
                  filters.status === item.value
                    ? "shadow-md shadow-[#007AFF]/20"
                    : "border-slate-200 bg-white text-slate-700"
                )}
                onClick={() => onChangeFilters({ status: item.value })}
              >
                {item.label}
              </Button>
            ))}
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-slate-200 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
          <div className="flex items-center gap-2">
            <MessageCircleWarning className="h-4 w-4 text-[#FF3B30]" />
            Queue
          </div>
          <span className="text-slate-400">{messages.length} results</span>
        </div>
        <div className="max-h-[650px] space-y-2 overflow-y-auto p-4 pr-3">
          {messages.length === 0 && (
            <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-200 bg-slate-50 px-4 py-10 text-center">
              <Shield className="h-6 w-6 text-slate-400" />
              <p className="mt-2 text-sm font-semibold text-slate-700">No flagged messages</p>
              <p className="text-xs text-slate-500">New events will appear here instantly.</p>
            </div>
          )}

          {messages.map((message) => (
            <button
              key={message.messageId}
              onClick={() => onSelect(message.messageId)}
              className={cn(
                "flex w-full flex-col gap-2 rounded-2xl border px-3 py-3 text-left transition-all",
                selectedMessageId === message.messageId
                  ? "border-[#007AFF] bg-[#E8F1FF] shadow-md"
                  : "border-slate-200 bg-white hover:-translate-y-0.5 hover:shadow-lg"
              )}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <BadgeAlert
                    className={cn(
                      "h-4 w-4",
                      message.category === "harassment"
                        ? "text-red-600"
                        : message.category === "spam"
                          ? "text-amber-600"
                          : message.category === "toxicity"
                            ? "text-purple-600"
                            : "text-slate-600"
                    )}
                  />
                  <p className="text-sm font-semibold text-slate-900">{message.sender}</p>
                  <span className="text-xs text-slate-500">Chat #{message.chatId}</span>
                </div>
                <span
                  className={cn(
                    "rounded-full border px-2 py-1 text-[11px] font-semibold",
                    categoryStyles[message.category]
                  )}
                >
                  {categoryLabels[message.category]}
                </span>
              </div>

              <p className="line-clamp-2 text-sm text-slate-700">{message.text}</p>

              <div className="flex items-center justify-between text-xs text-slate-500">
                <div className="flex items-center gap-2">
                  <span
                    className={cn(
                      "h-2 w-2 rounded-full",
                      message.status === "pending" ? "bg-amber-500" : "bg-emerald-500"
                    )}
                  />
                  <span className="font-semibold">{statusLabels[message.status]}</span>
                  <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-semibold text-slate-600">
                    Score {Math.round(message.score * 100)}%
                  </span>
                </div>
                <span className="font-medium">{formatTime(message.timestamp)}</span>
              </div>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
