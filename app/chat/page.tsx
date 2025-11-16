"use client";

import { useState } from "react";
import ChatSidebar from "./components/ChatSidebar";
import ChatWindow from "./components/ChatWindow";
import TopBar from "./components/TopBar";

export default function ChatPage() {
  const [selectedChat, setSelectedChat] = useState<number | null>(null);

  return (
    <div className="flex flex-col h-screen w-screen bg-[#F9FAFB] text-gray-800">
        <TopBar />
      {/* === Sidebar === */}
      <div className="flex flex-1">
      <aside className="w-[320px] bg-white border-r border-gray-200 shadow-[0_1px_2px_rgba(0,0,0,0.05)] rounded-tr-2xl rounded-br-2xl overflow-hidden">
        <ChatSidebar onSelectChat={setSelectedChat} selectedChat={selectedChat} />
      </aside>

      {/* === Main Chat === */}
      <main className="flex-1 flex flex-col p-4">
        <div className="flex-1 rounded-2xl bg-white shadow-[0_1px_3px_rgba(0,0,0,0.05)] border border-gray-200 overflow-hidden">
          {selectedChat ? (
            <ChatWindow chatId={selectedChat} />
          ) : (
            <div className="flex flex-col h-full items-center justify-center text-center px-6">
              <h2 className="text-gray-700 font-semibold text-lg">
                Select a chat to start messaging 💬
              </h2>
              <p className="text-sm text-gray-500 mt-2">
                Or click <span className="text-[#007AFF] font-medium">+ New</span> to begin.
              </p>
            </div>
          )}
        </div>
      </main>
      </div>
    </div>
  );
}
