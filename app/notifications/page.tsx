"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Bell,
  Check,
  CheckCheck,
  Trash2,
  ArrowLeft,
  MessageSquare,
  Flag,
  Shield,
  Info,
  Users,
  UserPlus,
  UserCheck,
} from "lucide-react";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";
import { useNotificationsStore, NotificationType } from "@/stores/useNotificationsStore";

export default function NotificationsPage() {
  const router = useRouter();
  const [updating, setUpdating] = useState<number | null>(null);

  const {
    notifications,
    loading,
    fetchNotifications,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    deleteNotification,
    getUnreadCount,
  } = useNotificationsStore();

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const handleMarkAsRead = async (id: number) => {
    setUpdating(id);
    await markNotificationAsRead(id);
    setUpdating(null);
    toast.success("Notification marked as read!")
  };

  const handleMarkAllAsRead = async () => {
    setUpdating(0); // Use 0 as a special ID for "all"
    await markAllNotificationsAsRead();
    setUpdating(null);
    toast.success("All notification are marked as read!")
  };

  const handleDeleteNotification = async (id: number) => {
    setUpdating(id);
    await deleteNotification(id);
    setUpdating(null);
    toast.success("Notification deleted successfully!")
  };

  const getNotificationIcon = (type: NotificationType) => {
    switch (type) {
      case "MESSAGE":
        return <MessageSquare className="w-5 h-5" />;
      case "CHAT":
        return <Users className="w-5 h-5" />;
      case "FLAGGED":
        return <Flag className="w-5 h-5" />;
      case "MODERATION":
        return <Shield className="w-5 h-5" />;
      case "SYSTEM":
        return <Info className="w-5 h-5" />;
      case "FRIEND_REQUEST":
        return <UserPlus className="w-5 h-5" />;
      case "FRIEND_ACTIVITY":
        return <UserCheck className="w-5 h-5" />;
      default:
        return <Bell className="w-5 h-5" />;
    }
  };

  const getNotificationColor = (type: NotificationType) => {
    switch (type) {
      case "MESSAGE":
        return "text-blue-600 bg-blue-50";
      case "CHAT":
        return "text-purple-600 bg-purple-50";
      case "FLAGGED":
        return "text-red-600 bg-red-50";
      case "MODERATION":
        return "text-orange-600 bg-orange-50";
      case "SYSTEM":
        return "text-gray-600 bg-gray-50";
      case "FRIEND_REQUEST":
        return "text-emerald-600 bg-emerald-50";
      case "FRIEND_ACTIVITY":
        return "text-sky-600 bg-sky-50";
      default:
        return "text-gray-600 bg-gray-50";
    }
  };

  const handleNotificationClick = (notification: typeof notifications[0]) => {
    // Navigate based on notification type
    if (notification.chat?.id) {
      router.push(`/chat?chatId=${notification.chat.id}`);
    } else if (notification.message?.id && notification.chatId) {
      router.push(`/chat?chatId=${notification.chatId}&messageId=${notification.message.id}`);
    }
    
    // Mark as read if unread
    if (!notification.isRead) {
      handleMarkAsRead(notification.id);
    }
  };

  const unreadCount = getUnreadCount();

  return (
    <div className="min-h-screen bg-[#F9FAFB] py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => router.back()}
              className="hover:bg-gray-100"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="text-2xl sm:text-3xl font-semibold text-gray-900 mb-1 flex items-center gap-2">
                <Bell className="w-6 h-6 text-[#007AFF]" />
                Notifications
              </h1>
              <p className="text-sm text-gray-600">
                {unreadCount > 0
                  ? `${unreadCount} unread ${unreadCount === 1 ? "notification" : "notifications"}`
                  : "All caught up!"}
              </p>
            </div>
          </div>
          {unreadCount > 0 && (
            <Button
              onClick={handleMarkAllAsRead}
              disabled={updating === 0}
              className="bg-[#007AFF] hover:bg-[#007AFF]/90 text-white"
            >
              <CheckCheck className="w-4 h-4 mr-2" />
              {updating === 0 ? "Marking..." : "Mark all as read"}
            </Button>
          )}
        </div>

        {/* Notifications List */}
        {loading ? (
          <Card>
            <CardContent className="py-12">
              <div className="flex flex-col items-center justify-center text-center">
                {/* <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#007AFF] mb-4"></div> */}
                <p className="text-gray-500">Loading notifications...</p>
              </div>
            </CardContent>
          </Card>
        ) : notifications.length === 0 ? (
          <Card>
            <CardContent className="py-12">
              <div className="flex flex-col items-center justify-center text-center">
                <Bell className="w-16 h-16 text-gray-300 mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  No notifications
                </h3>
                <p className="text-gray-500">
                  You&apos;re all caught up! Check back later for updates.
                </p>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {notifications.map((notification) => (
              <Card
                key={notification.id}
                className={`transition-all hover:shadow-md cursor-pointer ${
                  !notification.isRead
                    ? "border-l-4 border-l-[#007AFF] bg-white"
                    : "bg-gray-50"
                }`}
                onClick={() => handleNotificationClick(notification)}
              >
                <CardContent className="p-4">
                  <div className="flex items-start gap-4">
                    {/* Icon */}
                    <div
                      className={`shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${getNotificationColor(
                        notification.type
                      )}`}
                    >
                      {getNotificationIcon(notification.type)}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h3
                              className={`text-sm font-semibold ${
                                !notification.isRead
                                  ? "text-gray-900"
                                  : "text-gray-700"
                              }`}
                            >
                              {notification.title || "Notification"}
                            </h3>
                            {!notification.isRead && (
                              <span className="w-2 h-2 rounded-full bg-[#007AFF]"></span>
                            )}
                          </div>
                          {notification.content && (
                            <p className="text-sm text-gray-600 mb-2">
                              {notification.content}
                            </p>
                          )}
                          <p className="text-xs text-gray-500">
                            {formatDistanceToNow(new Date(notification.createdAt), {
                              addSuffix: true,
                            })}
                          </p>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                          {!notification.isRead && (
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleMarkAsRead(notification.id)}
                              disabled={updating === notification.id}
                              className="h-8 w-8 hover:bg-gray-100"
                              title="Mark as read"
                            >
                              <Check className="w-4 h-4" />
                            </Button>
                          )}
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDeleteNotification(notification.id)}
                            disabled={updating === notification.id}
                            className="h-8 w-8 hover:bg-red-50 hover:text-red-600"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

