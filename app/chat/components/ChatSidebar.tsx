"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { useChatsStore } from "@/stores/useChatsStore";
import { useUserStore } from "@/stores/useUserStore";

interface ChatSidebarProps {
  onSelectChat: (chatId: number) => void;
  selectedChat: number | null;
}

export default function ChatSidebar({ onSelectChat, selectedChat }: ChatSidebarProps) {
  const { chats, loading, fetchChats, getOtherUser, setSelectedChat } = useChatsStore();
  const { user } = useUserStore();

  useEffect(() => {
    fetchChats();
  }, [fetchChats]);

  useEffect(() => {
    setSelectedChat(selectedChat);
  }, [selectedChat, setSelectedChat]);

  return (
    <div className="flex flex-col h-full min-h-0 bg-white">
      <div className="flex-shrink-0 p-4 border-b border-slate-200 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-slate-900">Chats</h2>
        <Button
          size="sm"
          variant="default"
          className="rounded-lg shadow-sm"
          onClick={() => toast.info("TODO: Open New Chat Modal")}
        >
          + New
        </Button>
      </div>

      <div className="flex-1 min-h-0 overflow-y-auto p-3 space-y-2">
        {loading ? (
          <div className="text-center text-slate-400 py-12 text-sm">Loading chats...</div>
        ) : (
          <>
            {chats.map((chat) => {
              const otherUser = user ? getOtherUser(chat, user.id) : null;
              const displayName = otherUser?.username || "Unknown User";
              const lastMessageText = chat.lastMessage?.messageText || "No messages yet";

              return (
                <div
                  key={chat.id}
                  onClick={() => onSelectChat(chat.id)}
                  className={cn(
                    "cursor-pointer p-4 rounded-xl transition-all duration-150 border",
                    selectedChat === chat.id
                      ? "border-[#04C99B]/50 bg-[#E9F7F3]"
                      : "border-transparent bg-slate-50 hover:border-[#04C99B]/40 hover:bg-white"
                  )}
                >
                  <div className="font-semibold text-slate-900">{displayName}</div>
                  <div className="text-sm text-slate-500 truncate">{lastMessageText}</div>
                </div>
              );
            })}

            {chats.length === 0 && (
              <div className="text-center text-slate-400 py-12 text-sm">
                No chats yet. <br />
                Click <span className="text-[#04C99B] font-semibold">+ New</span> to start one.
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
