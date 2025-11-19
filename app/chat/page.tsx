"use client";

import { useState } from "react";
import ChatSidebar from "./components/ChatSidebar";
import ChatWindow from "./components/ChatWindow";
import TopBar from "./components/TopBar";

export default function ChatPage() {
  const [selectedChat, setSelectedChat] = useState<number | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex flex-col h-screen w-screen bg-[#F5F8FD] text-slate-900">
      <TopBar onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />

      <div className="flex flex-1 min-h-0 overflow-hidden">
        {/* Mobile sidebar */}
        <aside
          className={`fixed inset-y-0 left-0 w-72 bg-white shadow-xl z-30 transform transition-transform duration-300 ${
            sidebarOpen ? "translate-x-0" : "-translate-x-full"
          } sm:hidden overflow-hidden`}
        >
          <ChatSidebar
            onSelectChat={(id) => {
              setSelectedChat(id);
              setSidebarOpen(false);
            }}
            selectedChat={selectedChat}
          />
        </aside>

        {/* Backdrop */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-slate-900/40 z-20 sm:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Desktop sidebar */}
        <aside className="hidden sm:block w-[320px] h-full bg-white border-r border-slate-200 shadow-sm">
          <ChatSidebar onSelectChat={setSelectedChat} selectedChat={selectedChat} />
        </aside>

        {/* Main chat */}
        <main className="flex-1 min-h-0 flex flex-col p-4 sm:p-6">
          <div className="flex-1 min-h-0 rounded-2xl bg-white shadow-md border border-slate-100 overflow-hidden">
            {selectedChat ? (
              <ChatWindow chatId={selectedChat} />
            ) : (
              <div className="flex items-center justify-center h-full flex-col text-center px-6 gap-2">
                <h2 className="text-slate-800 font-semibold text-xl">Pick a chat to start messaging</h2>
                <p className="text-sm text-slate-500">
                  Or tap <span className="text-[#04C99B] font-semibold">+ New</span> to begin a conversation.
                </p>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
