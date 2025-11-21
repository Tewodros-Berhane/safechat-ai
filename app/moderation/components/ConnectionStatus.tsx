"use client";

import { Wifi, WifiOff, WifiIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export type ConnectionState = "connecting" | "connected" | "disconnected";

interface ConnectionStatusProps {
  status: ConnectionState;
  lastEventAt?: string | null;
}

export default function ConnectionStatus({ status, lastEventAt }: ConnectionStatusProps) {
  const label =
    status === "connected" ? "Connected" : status === "connecting" ? "Reconnecting…" : "Disconnected";
  const icon =
    status === "connected" ? <Wifi className="h-4 w-4" /> : status === "connecting" ? <WifiIcon className="h-4 w-4" /> : <WifiOff className="h-4 w-4" />;

  return (
    <div
      className={cn(
        "fixed bottom-4 left-1/2 z-30 flex -translate-x-1/2 items-center gap-3 rounded-full border px-4 py-2 text-sm shadow-lg transition-all",
        status === "connected"
          ? "border-emerald-100 bg-emerald-50 text-emerald-700"
          : status === "connecting"
            ? "border-amber-100 bg-amber-50 text-amber-700"
            : "border-red-100 bg-red-50 text-red-700"
      )}
    >
      <span className="flex h-2 w-2 rounded-full bg-current opacity-80" />
      {icon}
      <span className="font-semibold">{label}</span>
      {lastEventAt && (
        <span className="text-xs text-current/70">
          Last event {new Intl.DateTimeFormat("en", { hour: "2-digit", minute: "2-digit" }).format(new Date(lastEventAt))}
        </span>
      )}
    </div>
  );
}
