"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface ChatSidebarProps {
  onSelectChat: (chatId: number) => void;
  selectedChat: number | null;
}

export default function ChatSidebar({ onSelectChat, selectedChat }: ChatSidebarProps) {
  const [chats, setChats] = useState<{ id: number; name: string; lastMessage: string }[]>([]);

  useEffect(() => {
    // TODO: Fetch user chats
    setChats([
      { id: 1, name: "John Doe", lastMessage: "Hey, how are you?" },
      { id: 2, name: "Support Bot", lastMessage: "Welcome to SafeChat.AI!" },
    ]);
  }, []);

  return (
    <div className="flex flex-col h-full">
      {/* Header — simplified (no brand) */}
      <div className="p-4 border-b border-gray-200 flex items-center justify-between bg-[#F9FAFB]">
        <h2 className="text-lg font-semibold text-gray-800">Chats</h2>
        <Button
          size="sm"
          variant="outline"
          className="text-[#007AFF] border-[#007AFF] hover:bg-[#007AFF] hover:text-white transition-all rounded-lg"
          onClick={() => toast.info("TODO: Open New Chat Modal")}
        >
          + New
        </Button>
      </div>

      {/* Chat List */}
      <div className="flex-1 overflow-y-auto p-2">
        {chats.map((chat) => (
          <div
            key={chat.id}
            onClick={() => onSelectChat(chat.id)}
            className={cn(
              "cursor-pointer p-4 mb-2 rounded-xl transition-all duration-200",
              selectedChat === chat.id
                ? "bg-[#E5F0FF] border border-[#007AFF]/30"
                : "hover:bg-gray-50 border border-transparent"
            )}
          >
            <div className="font-medium text-gray-900">{chat.name}</div>
            <div className="text-sm text-gray-500 truncate">{chat.lastMessage}</div>
          </div>
        ))}

        {chats.length === 0 && (
          <div className="text-center text-gray-400 py-12 text-sm">
            No chats yet. <br />
            Click <span className="text-[#007AFF]">+ New</span> to start one.
          </div>
        )}
      </div>
    </div>
  );
}
