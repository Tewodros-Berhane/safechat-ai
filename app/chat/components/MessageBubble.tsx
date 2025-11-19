"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { CheckCheck } from "lucide-react";
import { format } from "date-fns";

interface MessageBubbleProps {
  text: string;
  senderName: string;
  isOwn: boolean;
  timestamp: string;
  avatarUrl?: string | null;
  isRead?: boolean;
}

export default function MessageBubble({
  text,
  senderName,
  isOwn,
  timestamp,
  avatarUrl,
  isRead = false,
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
            isOwn ? "text-white/80" : "text-slate-400"
          )}
        >
          <span>{timeLabel}</span>
          {isOwn && (
            <CheckCheck
              className={cn("h-3.5 w-3.5", isRead ? "text-[#CFF8ED]" : "text-white/60")}
              aria-label={isRead ? "Read" : "Delivered"}
            />
          )}
        </div>
      </div>
      </div>
    </div>
  );
}
