"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { AlertCircle, Check, CheckCheck, Loader2 } from "lucide-react";
import { format } from "date-fns";

interface MessageBubbleProps {
  text: string;
  senderName: string;
  isOwn: boolean;
  timestamp: string;
  avatarUrl?: string | null;
  isRead?: boolean;
  status?: "pending" | "failed" | "sent";
}

export default function MessageBubble({
  text,
  senderName,
  isOwn,
  timestamp,
  avatarUrl,
  isRead = false,
  status = "sent",
}: MessageBubbleProps) {
  const timeLabel = format(new Date(timestamp), "p");
  const initials = senderName
    .split(" ")
    .map((word) => word[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className={cn("flex w-full", isOwn ? "justify-end" : "justify-start")}>
      <div className={cn("flex items-end gap-2", isOwn ? "flex-row-reverse" : "flex-row")}>
        <Avatar className="h-8 w-8">
          <AvatarImage src={avatarUrl || undefined} alt={senderName} />
          <AvatarFallback className="bg-slate-200 text-slate-600 text-xs">{initials}</AvatarFallback>
        </Avatar>
        <div
          className={cn(
            "max-w-[75%] rounded-2xl px-4 py-2 text-sm shadow-sm border",
            isOwn
              ? "bg-[#04C99B] text-white border-transparent rounded-br-sm"
              : "bg-white text-slate-900 border-slate-200 rounded-bl-sm"
          )}
        >
          <p className="leading-relaxed whitespace-pre-wrap break-words">{text}</p>
          <div
            className={cn(
              "mt-1 flex items-center justify-end gap-1 text-[11px]",
              status === "failed"
                ? isOwn
                  ? "text-amber-200"
                  : "text-amber-600"
                : isOwn
                  ? "text-white/80"
                  : "text-slate-400"
            )}
          >
            <span>{timeLabel}</span>
            {isOwn && (
              <span className="flex items-center gap-1">
                {status === "pending" && (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" aria-label="Sending" />
                )}
                {status === "failed" && (
                  <AlertCircle className="h-3.5 w-3.5" aria-label="Failed to send" />
                )}
                {status === "sent" &&
                  (isRead ? (
                    <CheckCheck
                      className={cn("h-3.5 w-3.5", "text-[#CFF8ED]")}
                      aria-label="Read"
                    />
                  ) : (
                    <Check
                      className={cn("h-3.5 w-3.5", "text-white/80")}
                      aria-label="Sent"
                    />
                  ))}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
