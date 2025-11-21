"use client";

import { Fragment } from "react";
import { ClipboardList, Clock3, Focus, Info, Sparkles, UserSearch } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ConversationMessage, FlaggedMessage } from "@/stores/useModerationStore";

interface MessageReviewPanelProps {
  message?: FlaggedMessage | null;
}

const severityColor = (score: number) => {
  if (score >= 0.9) return "text-red-600 bg-red-50 border-red-100";
  if (score >= 0.75) return "text-amber-700 bg-amber-50 border-amber-100";
  return "text-slate-700 bg-slate-100 border-slate-200";
};

const labelForCategory: Record<FlaggedMessage["category"], string> = {
  harassment: "Harassment",
  spam: "Spam",
  toxicity: "Toxicity",
  "self-harm": "Self-harm",
  "hate-speech": "Hate speech",
  other: "Other",
};

const formatTimestamp = (timestamp: string) =>
  new Intl.DateTimeFormat("en", { hour: "2-digit", minute: "2-digit", month: "short", day: "numeric" }).format(
    new Date(timestamp)
  );

const ContextThread = ({ context }: { context?: ConversationMessage[] }) => {
  if (!context || context.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 px-4 py-6 text-center text-sm text-slate-500">
        No prior context pulled in for this message.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {context.map((item, index) => (
        <Fragment key={`${item.timestamp}-${index}`}>
          <div
            className={cn(
              "rounded-xl border px-3 py-2",
              item.isFlagged ? "border-[#FF3B30] bg-red-50" : "border-slate-200 bg-slate-50"
            )}
          >
            <div className="flex items-center justify-between text-xs text-slate-500">
              <span className="font-semibold text-slate-800">{item.sender}</span>
              <span>{formatTimestamp(item.timestamp)}</span>
            </div>
            <p className="text-sm text-slate-800">{item.text}</p>
          </div>
        </Fragment>
      ))}
    </div>
  );
};

export default function MessageReviewPanel({ message }: MessageReviewPanelProps) {
  if (!message) {
    return (
      <section className="flex h-full flex-1 items-center justify-center rounded-2xl border border-slate-200 bg-white text-center shadow-sm">
        <div className="max-w-sm space-y-2 px-6 py-8">
          <Info className="mx-auto h-6 w-6 text-slate-400" />
          <p className="text-base font-semibold text-slate-900">Select a message</p>
          <p className="text-sm text-slate-600">Review details, AI analysis, and conversation context here.</p>
        </div>
      </section>
    );
  }

  return (
    <section className="flex h-full flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Selected message</p>
          <p className="text-lg font-bold text-slate-900">{message.sender}</p>
          <p className="text-sm text-slate-500">Chat #{message.chatId}</p>
        </div>
        <div className="flex items-center gap-2">
          <span
            className={cn(
              "rounded-full border px-3 py-1 text-sm font-semibold",
              severityColor(message.score)
            )}
          >
            {Math.round(message.score * 100)}% risk
          </span>
          <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
            {labelForCategory[message.category]}
          </span>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4 shadow-inner">
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
          <Focus className="h-4 w-4 text-[#007AFF]" />
          Message
        </div>
        <p className="mt-2 text-sm leading-relaxed text-slate-800">{message.text}</p>
        <div className="mt-3 flex items-center gap-3 text-xs text-slate-500">
          <Clock3 className="h-4 w-4" />
          {formatTimestamp(message.timestamp)}
          {message.origin && (
            <span className="rounded-full bg-white px-2 py-0.5 text-[11px] font-semibold text-slate-600">
              {message.origin === "ai" ? "AI detected" : "User report"}
            </span>
          )}
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-inner">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
            <Sparkles className="h-4 w-4 text-[#7C3AED]" />
            AI analysis
          </div>
          <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-semibold text-slate-600">
            Status: {message.status === "pending" ? "Awaiting review" : "Reviewed"}
          </span>
        </div>
        <p className="mt-2 text-sm text-slate-700">
          {message.aiSummary || "The AI flagged this message for review. No additional summary provided."}
        </p>
      </div>

      <div className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-inner">
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
          <ClipboardList className="h-4 w-4 text-[#007AFF]" />
          Conversation context
        </div>
        <ContextThread context={message.context} />
      </div>

      <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4 shadow-inner">
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
          <UserSearch className="h-4 w-4 text-[#04C99B]" />
          User details
        </div>
        <div className="mt-2 grid grid-cols-2 gap-3 text-sm text-slate-700 sm:grid-cols-4">
          <div>
            <p className="text-xs text-slate-500">Sender</p>
            <p className="font-semibold text-slate-900">{message.sender}</p>
          </div>
          <div>
            <p className="text-xs text-slate-500">User ID</p>
            <p className="font-semibold text-slate-900">{message.senderId ?? "—"}</p>
          </div>
          <div>
            <p className="text-xs text-slate-500">Chat</p>
            <p className="font-semibold text-slate-900">#{message.chatId}</p>
          </div>
          <div>
            <p className="text-xs text-slate-500">Status</p>
            <p className="font-semibold text-slate-900 capitalize">{message.status}</p>
          </div>
        </div>
      </div>
    </section>
  );
}
