"use client";

import { useEffect, useRef } from "react";
import MessageInput from "./MessageInput";
import MessageBubble from "./MessageBubble";
import { useChatsStore } from "@/stores/useChatsStore";
import { useUserStore } from "@/stores/useUserStore";
import { toast } from "sonner";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getPresenceInfo } from "@/lib/presence";

interface ChatWindowProps {
  chatId: number;
}

export default function ChatWindow({ chatId }: ChatWindowProps) {
  const chat = useChatsStore(
    (state) => state.chats.find((chatItem) => chatItem.id === chatId)
  );
  const chatMessages = useChatsStore((state) => state.messages[chatId]);
  const isLoading = useChatsStore((state) => state.messagesLoading[chatId]);
  const fetchMessages = useChatsStore((state) => state.fetchMessages);
  const sendMessage = useChatsStore((state) => state.sendMessage);
  const getOtherUser = useChatsStore((state) => state.getOtherUser);
  const { user } = useUserStore();
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const otherUser = user && chat ? getOtherUser(chat, user.id) : null;
  const displayName = otherUser?.username || "Unknown User";
  const presence = getPresenceInfo({
    isPrivate: false,
    isOnline: false,
    lastSeen: undefined,
    ...otherUser,
  });
  useEffect(() => {
    fetchMessages(chatId);
  }, [chatId, fetchMessages]);

  useEffect(() => {
    const container = messagesContainerRef.current;
    if (!container) {
      return;
    }
    container.scrollTop = container.scrollHeight;
  }, [chatId, chatMessages?.length]);

  const handleSend = async (newMessage: string) => {
    const sentMessage = await sendMessage(chatId, newMessage);
    if (!sentMessage) {
      toast.error("Failed to send message");
    }
  };

  return (
    <div className="flex flex-col h-full min-h-0">
      {/* Header */}
      <div className="flex-shrink-0 px-6 py-4 border-b border-slate-200 bg-white">
        <div className="flex items-center gap-3">
          <div className="relative">
            <Avatar className="h-11 w-11">
              <AvatarImage src={otherUser?.profilePic || undefined} alt={displayName} />
              <AvatarFallback className="bg-[#04C99B]/15 text-[#007AFF] font-semibold">
                {displayName.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            {presence.showDot && (
              <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-white bg-emerald-500" />
            )}
          </div>
          <div>
            <h2 className="font-semibold text-slate-900 text-lg">{displayName}</h2>
            <p className="text-sm text-slate-500">{presence.text}</p>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div
        ref={messagesContainerRef}
        className="flex-1 min-h-0 overflow-y-auto p-6 bg-[#F7FAFE] space-y-4"
      >
        {(isLoading ?? false) ? (
          <div className="text-center text-slate-400 py-12 text-sm">Loading messages...</div>
        ) : (
          <>
            {(chatMessages ?? []).map((msg) => {
              const isOwn = msg.userId === user?.id;
              const senderName = isOwn ? "You" : msg.user?.username || "Unknown";
              const avatarUrl = msg.user?.profilePic || undefined;
              const recipientId = isOwn ? otherUser?.id : user?.id;
              const status = msg.status || "sent";
              const hasBeenRead =
                isOwn && recipientId
                  ? Boolean(
                      msg.readReceipts?.some((receipt) => receipt.userId === recipientId)
                    )
                  : false;

              return (
                <MessageBubble
                  key={msg.id}
                  text={msg.messageText}
                  senderName={senderName}
                  isOwn={isOwn}
                  timestamp={msg.createdAt}
                  avatarUrl={avatarUrl}
                  isRead={hasBeenRead}
                  status={status}
                />
              );
            })}

            {(chatMessages?.length ?? 0) === 0 && (
              <div className="text-center text-slate-400 py-12 text-sm">
                No messages yet. Start the conversation!
              </div>
            )}
          </>
        )}
      </div>

      {/* Input */}
      <div className="flex-shrink-0 px-6 py-4 border-t border-slate-200 bg-white">
        <MessageInput onSend={handleSend} />
      </div>
    </div>
  );
}
