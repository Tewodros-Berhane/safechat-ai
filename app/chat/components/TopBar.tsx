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
import { Bell, Dot, Menu, User, Settings, LogOut, ChevronRight } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export default function TopBar({ onToggleSidebar }: { onToggleSidebar: () => void }) {
  const router = useRouter();
  const [notifications] = useState([
    { id: 1, message: "New message from John Doe", time: "2m ago" },
    { id: 2, message: "AI moderation report ready", time: "10m ago" },
    { id: 3, message: "Support Bot sent a reply", time: "30m ago" },
  ]);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const recentNotifications = notifications.slice(0, 4);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      const response = await fetch("/api/auth/logout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });

      if (response.ok) {
        toast.success("Logged out successfully");
        router.push("/auth/login");
      } else {
        const { error } = await response.json();
        toast.error(error || "Failed to logout. Please try again.");
        setIsLoggingOut(false);
      }
    } catch (error) {
      console.error("Logout error:", error);
      toast.error("An error occurred during logout. Please try again.");
      setIsLoggingOut(false);
    }
  };

  return (
    <header className="w-full h-14 border-b border-gray-200 bg-white shadow flex items-center justify-between px-4 sm:px-6">
      
      {/* MOBILE MENU BUTTON */}
      <button
        className="sm:hidden p-2 hover:bg-gray-100 rounded-lg transition"
        onClick={onToggleSidebar}
      >
        <Menu className="w-6 h-6 text-gray-700" />
      </button>

      {/* BRANDING */}
      <div className="flex items-center gap-2">
        <div className="bg-[#007AFF] text-white font-semibold rounded-xl w-8 h-8 flex items-center justify-center">
          S
        </div>
        <span className="text-lg font-semibold hidden sm:block">
          SafeChat<span className="text-[#007AFF]">.AI</span>
        </span>
      </div>

      {/* RIGHT SECTION */}
      <div className="flex items-center gap-4">
        {/* Notifications */}
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
              onClick={() => router.push("/profile")}
              className="flex items-center gap-2 cursor-pointer hover:bg-gray-50"
            >
              <User className="w-4 h-4 text-gray-500" />
              <span>Profile</span>
            </DropdownMenuItem>

            <DropdownMenuSeparator />

            <DropdownMenuItem
              onClick={handleLogout}
              disabled={isLoggingOut}
              className="flex items-center gap-2 text-red-600 cursor-pointer hover:bg-red-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <LogOut className="w-4 h-4" />
              <span>{isLoggingOut ? "Logging out..." : "Logout"}</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
