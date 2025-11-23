"use client";

import { useEffect, useState } from "react";
import { MessageSquare } from "lucide-react";

interface AdminChat {
  id: number;
  name?: string | null;
  createdAt: string;
  messageCount: number;
  lastMessage: {
    id: number;
    messageText: string;
    isFlagged: boolean;
    createdAt: string;
  } | null;
}

export default function AdminChatsPage() {
  const [chats, setChats] = useState<AdminChat[]>([]);

  const loadChats = async () => {
    const res = await fetch("/api/admin/chats");
    if (res.ok) {
      const data = await res.json();
      setChats(data);
    }
  };

  useEffect(() => {
    loadChats();
  }, []);

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <MessageSquare className="h-5 w-5 text-[#007AFF]" />
        <div>
          <p className="text-sm text-slate-500">Conversations</p>
          <h1 className="text-xl font-semibold text-slate-900">Chats</h1>
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white/80 shadow-sm">
        <div className="grid grid-cols-12 bg-slate-50 px-4 py-3 text-xs font-semibold uppercase text-slate-500">
          <div className="col-span-4">Chat</div>
          <div className="col-span-4">Last message</div>
          <div className="col-span-2">Flags</div>
          <div className="col-span-2 text-right">Messages</div>
        </div>
        <div className="divide-y divide-slate-100">
          {chats.map((chat) => (
            <div key={chat.id} className="grid grid-cols-12 px-4 py-3 text-sm hover:bg-slate-50">
              <div className="col-span-4">
                <p className="font-semibold">Chat #{chat.id}</p>
                <p className="text-xs text-slate-500">{chat.name || "Direct chat"}</p>
              </div>
              <div className="col-span-4">
                {chat.lastMessage ? (
                  <>
                    <p className="text-slate-800 line-clamp-2">{chat.lastMessage.messageText}</p>
                    <p className="text-xs text-slate-500 mt-1">
                      {chat.lastMessage.createdAt.slice(0, 19).replace("T", " ")}
                    </p>
                  </>
                ) : (
                  <p className="text-slate-500 text-sm">No messages yet</p>
                )}
              </div>
              <div className="col-span-2">
                {chat.lastMessage?.isFlagged ? (
                  <span className="rounded-full bg-amber-100 text-amber-700 px-2 py-1 text-xs font-semibold">
                    Flagged
                  </span>
                ) : (
                  <span className="rounded-full bg-emerald-50 text-emerald-700 px-2 py-1 text-xs font-semibold">
                    Clean
                  </span>
                )}
              </div>
              <div className="col-span-2 text-right font-semibold text-slate-800">
                {chat.messageCount}
              </div>
            </div>
          ))}
          {chats.length === 0 && (
            <div className="px-4 py-6 text-sm text-slate-500">No chats to display.</div>
          )}
        </div>
      </div>
    </div>
  );
}
