"use client";

import { Bell, LogOut, ShieldCheck, UserRound } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";

interface TopBarProps {
  moderatorName?: string;
  pendingCount: number;
}

export default function TopBar({ moderatorName = "Moderator", pendingCount }: TopBarProps) {
  return (
    <header className="sticky top-0 z-20 flex items-center justify-between rounded-2xl border border-slate-200 bg-white/90 px-5 py-3 shadow-sm backdrop-blur">
      <div className="flex items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-[#007AFF] to-[#04C99B] text-white shadow-lg shadow-[#007AFF]/30">
          <ShieldCheck className="h-5 w-5" />
        </div>
        <div>
          <p className="text-sm font-semibold text-slate-500">SafeChat.AI</p>
          <p className="text-lg font-bold text-slate-900">Moderator</p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <Button variant="outline" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {pendingCount > 0 && (
            <span className="absolute -right-1 -top-1 inline-flex h-5 min-w-[20px] items-center justify-center rounded-full bg-[#FF3B30] px-1 text-[11px] font-semibold text-white shadow-sm">
              {pendingCount}
            </span>
          )}
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="secondary" className="gap-2 rounded-full px-3">
              <UserRound className="h-4 w-4 text-slate-600" />
              <span className="text-sm font-semibold text-slate-800">{moderatorName}</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="min-w-[180px]">
            <DropdownMenuLabel className="text-xs text-slate-500">Session</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="cursor-default text-slate-700">Profile</DropdownMenuItem>
            <DropdownMenuItem className="cursor-default text-slate-700">Settings</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-red-600 focus:text-red-600">
              <LogOut className="h-4 w-4" />
              Logout
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
