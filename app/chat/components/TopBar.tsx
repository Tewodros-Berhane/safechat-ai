"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Bell, Dot, Menu, User, LogOut, ChevronRight } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { useUserStore } from "@/stores/useUserStore";
import { useNotificationsStore } from "@/stores/useNotificationsStore";
import { useChatsStore } from "@/stores/useChatsStore";
import { formatDistanceToNow } from "date-fns";

export default function TopBar({ onToggleSidebar }: { onToggleSidebar: () => void }) {
  const router = useRouter();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  // Zustand stores
  const { user, fetchUser, clearUser } = useUserStore();
  const {
    getUnreadNotifications,
    getUnreadCount,
    fetchNotifications,
    clearAll: clearNotifications,
  } = useNotificationsStore();
  const { clearAll: clearChats } = useChatsStore();

  useEffect(() => {
    fetchUser();
    fetchNotifications();
  }, [fetchUser, fetchNotifications]);

  const unreadNotifications = getUnreadNotifications(3);
  const unreadCount = getUnreadCount();

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      const response = await fetch("/api/auth/logout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });

      if (response.ok) {
        // Clear all stores on logout
        clearUser();
        clearNotifications();
        clearChats();
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
              {unreadCount > 0 && (
                <Dot className="absolute top-1 right-1 w-4 h-4 text-[#007AFF]" />
              )}
            </button>
          </DropdownMenuTrigger>

          <DropdownMenuContent
            align="end"
            className="w-72 rounded-xl shadow-lg border border-gray-100 bg-white overflow-hidden"
          >
            <DropdownMenuLabel className="text-gray-500 text-xs font-semibold uppercase px-3 py-2">
              Notifications
            </DropdownMenuLabel>

            {unreadNotifications.length > 0 ? (
              unreadNotifications.map((notif) => (
                <DropdownMenuItem
                  key={notif.id}
                  className="flex flex-col items-start gap-1 px-4 py-2 cursor-pointer hover:bg-gray-50"
                >
                  <span className="text-sm text-gray-800">{notif.title || notif.content || "Notification"}</span>
                  <span className="text-xs text-gray-500">
                    {formatDistanceToNow(new Date(notif.createdAt), { addSuffix: true })}
                  </span>
                </DropdownMenuItem>
              ))
            ) : (
              <div className="text-center text-gray-400 text-sm py-4">
                No new notifications
              </div>
            )}

            <DropdownMenuSeparator />

            <DropdownMenuItem
              onClick={() => router.push("/notifications")}
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
                <AvatarImage src={user?.profilePic || undefined} alt={user?.username || "User"} />
                <AvatarFallback className="bg-[#007AFF]/10 text-[#007AFF] font-semibold">
                  {user?.username?.charAt(0).toUpperCase() || "U"}
                </AvatarFallback> 
              </Avatar>
              <span className="text-sm font-medium text-gray-700">{user?.username || "User"}</span>
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
