"use client";

import { useRouter } from "next/navigation";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Settings, User, LogOut, Bell, Dot, ChevronRight } from "lucide-react";
import { useState } from "react";

export default function TopBar() {
  const router = useRouter();
  const [notifications, setNotifications] = useState([
    { id: 1, message: "New message from John Doe", time: "2m ago" },
    { id: 2, message: "AI moderation report ready", time: "10m ago" },
    { id: 3, message: "Support Bot sent a reply", time: "30m ago" },
    { id: 4, message: "Password successfully changed", time: "1h ago" },
    { id: 5, message: "System update scheduled", time: "3h ago" },
  ]);

  const recentNotifications = notifications.slice(0, 4);

  return (
    <header className="w-full h-14 border-b border-gray-200 bg-white shadow-[0_1px_2px_rgba(0,0,0,0.05)] flex items-center justify-between px-6">
      {/* === Left: Branding === */}
      <div className="flex items-center gap-2">
        <div className="bg-[#007AFF] text-white font-semibold rounded-xl w-8 h-8 flex items-center justify-center">
          S
        </div>
        <span className="text-lg font-semibold">
          SafeChat<span className="text-[#007AFF]">.AI</span>
        </span>
      </div>

      {/* === Right Section === */}
      <div className="flex items-center gap-4">
        {/* === Notifications Dropdown === */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="relative hover:bg-gray-50 p-2 rounded-lg transition-all">
              <Bell className="w-5 h-5 text-gray-600" />
              <Dot className="absolute top-1 right-1 w-4 h-4 text-[#007AFF]" />
            </button>
          </DropdownMenuTrigger>

          <DropdownMenuContent
            align="end"
            className="w-72 rounded-xl shadow-lg border border-gray-100 bg-white overflow-hidden"
          >
            <DropdownMenuLabel className="text-gray-500 text-xs font-semibold uppercase px-3 py-2">
              Notifications
            </DropdownMenuLabel>

            {recentNotifications.length > 0 ? (
              recentNotifications.map((notif) => (
                <DropdownMenuItem
                  key={notif.id}
                  className="flex flex-col items-start gap-1 px-4 py-2 cursor-pointer hover:bg-gray-50"
                >
                  <span className="text-sm text-gray-800">{notif.message}</span>
                  <span className="text-xs text-gray-500">{notif.time}</span>
                </DropdownMenuItem>
              ))
            ) : (
              <div className="text-center text-gray-400 text-sm py-4">
                No new notifications
              </div>
            )}

            <DropdownMenuSeparator />

            <DropdownMenuItem
              onClick={() => alert("TODO: Go to notifications page")}
              className="text-center text-[#007AFF] text-sm font-medium py-2 hover:bg-blue-50 cursor-pointer"
            >
              View all notifications <ChevronRight/>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* === User Dropdown === */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <div className="flex items-center gap-3 cursor-pointer hover:bg-gray-50 px-3 py-1.5 rounded-lg transition-all">
              <Avatar className="h-9 w-9 border border-gray-200">
                <AvatarImage src="/placeholder-user.jpg" alt="User" />
                <AvatarFallback className="bg-[#007AFF]/10 text-[#007AFF] font-semibold">
                  M
                </AvatarFallback>
              </Avatar>
              <span className="text-sm font-medium text-gray-700">Michael Doe</span>
            </div>
          </DropdownMenuTrigger>

          <DropdownMenuContent
            align="end"
            className="w-48 rounded-xl shadow-lg border border-gray-100 bg-white"
          >
            <DropdownMenuLabel className="text-gray-500 text-xs font-semibold uppercase">
              Account
            </DropdownMenuLabel>

            <DropdownMenuItem
              onClick={() => alert("TODO: open profile")}
              className="flex items-center gap-2 cursor-pointer hover:bg-gray-50"
            >
              <User className="w-4 h-4 text-gray-500" />
              <span>Profile</span>
            </DropdownMenuItem>

            <DropdownMenuItem
              onClick={() => alert("TODO: open settings")}
              className="flex items-center gap-2 cursor-pointer hover:bg-gray-50"
            >
              <Settings className="w-4 h-4 text-gray-500" />
              <span>Settings</span>
            </DropdownMenuItem>

            <DropdownMenuSeparator />

            <DropdownMenuItem
              onClick={() => {
                // TODO: Replace with NextAuth signOut()
                router.push("/auth/login");
              }}
              className="flex items-center gap-2 text-red-600 cursor-pointer hover:bg-red-50"
            >
              <LogOut className="w-4 h-4" />
              <span>Logout</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
