"use client";

import { useEffect, useState } from "react";
import MessageInput from "./MessageInput";
import MessageBubble from "./MessageBubble";

interface ChatWindowProps {
  chatId: number;
}

export default function ChatWindow({ chatId }: ChatWindowProps) {
  const [messages, setMessages] = useState<{ id: number; sender: string; text: string }[]>([]);

  useEffect(() => {
    // TODO: Fetch messages from API
    setMessages([
      { id: 1, sender: "John Doe", text: "Hey, how are you?" },
      { id: 2, sender: "You", text: "I’m good, thanks!" },
    ]);
  }, [chatId]);

  const handleSend = (newMessage: string) => {
    // TODO: Send via API & integrate AI moderation
    setMessages((prev) => [...prev, { id: Date.now(), sender: "You", text: newMessage }]);
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200 bg-white">
        <h2 className="font-semibold text-gray-900 text-lg">John Doe</h2>
        <p className="text-sm text-gray-500">Active now</p>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-6 bg-[#F9FAFB] space-y-3">
        {messages.map((msg) => (
          <MessageBubble key={msg.id} text={msg.text} sender={msg.sender} />
        ))}
      </div>

      {/* Input */}
      <div className="px-6 py-4 border-t border-gray-200 bg-white">
        <MessageInput onSend={handleSend} />
      </div>
    </div>
  );
}
