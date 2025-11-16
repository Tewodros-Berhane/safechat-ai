"use client";

import { useState } from "react";
import ChatSidebar from "./components/ChatSidebar";
import ChatWindow from "./components/ChatWindow";
import TopBar from "./components/TopBar";

export default function ChatPage() {
  const [selectedChat, setSelectedChat] = useState<number | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex flex-col h-screen w-screen bg-[#F9FAFB] text-gray-800">
      
      <TopBar onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />

      <div className="flex flex-1 relative">

        {/* === MOBILE SIDEBAR (Slide-In) === */}
        <aside
          className={`
            fixed inset-y-0 left-0 w-72 bg-white shadow-lg z-30 transform transition-transform duration-300
            ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
            sm:hidden
          `}
        >
          <ChatSidebar onSelectChat={(id) => { setSelectedChat(id); setSidebarOpen(false); }} selectedChat={selectedChat} />
        </aside>

        {/* BACKDROP */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black/40 z-20 sm:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* === DESKTOP SIDEBAR === */}
        <aside className="hidden sm:block w-[320px] bg-white border-r border-gray-200 shadow-sm">
          <ChatSidebar onSelectChat={setSelectedChat} selectedChat={selectedChat} />
        </aside>

        {/* === MAIN CHAT === */}
        <main className="flex-1 flex flex-col p-4">
          <div className="flex-1 rounded-2xl bg-white shadow border overflow-hidden">
            {selectedChat ? (
              <ChatWindow chatId={selectedChat} />
            ) : (
              <div className="flex items-center justify-center h-full flex-col text-center px-6">
                <h2 className="text-gray-700 font-semibold text-lg">Select a chat to start messaging 💬</h2>
                <p className="text-sm text-gray-500 mt-2">Or click <span className="text-[#007AFF] font-medium">+ New</span> to begin.</p>
              </div>
            )}
          </div>
        </main>

      </div>
    </div>
  );
}
