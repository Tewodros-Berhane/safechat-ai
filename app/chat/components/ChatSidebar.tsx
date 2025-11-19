"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { useChatsStore } from "@/stores/useChatsStore";
import { useUserStore } from "@/stores/useUserStore";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useFriendsStore } from "@/stores/useFriendsStore";
import { Search, Users, Shield, CheckCheck } from "lucide-react";
import { formatDistanceToNowStrict } from "date-fns";

type Relationship = "FRIEND" | "OUTGOING_REQUEST" | "INCOMING_REQUEST" | "NONE";

interface SearchResult {
  id: number;
  username: string;
  email: string;
  profilePic: string | null;
  isPrivate: boolean;
  relationship: Relationship;
}

interface ChatSidebarProps {
  onSelectChat: (chatId: number) => void;
  selectedChat: number | null;
}

export default function ChatSidebar({ onSelectChat, selectedChat }: ChatSidebarProps) {
  const {
    chats,
    loading,
    fetchChats,
    getOtherUser,
    setSelectedChat,
    createChat,
  } = useChatsStore();
  const { user } = useUserStore();
  const { sendFriendRequest } = useFriendsStore();

  const [isNewChatOpen, setIsNewChatOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [chattingUserId, setChattingUserId] = useState<number | null>(null);
  const [requestingUserId, setRequestingUserId] = useState<number | null>(null);

  useEffect(() => {
    fetchChats();
  }, [fetchChats]);

  useEffect(() => {
    setSelectedChat(selectedChat);
  }, [selectedChat, setSelectedChat]);

  useEffect(() => {
    if (!isNewChatOpen) {
      setSearchQuery("");
      setSearchResults([]);
      return;
    }

    if (!searchQuery.trim()) {
      setSearchResults([]);
      setSearchLoading(false);
      return;
    }

    setSearchLoading(true);
    const controller = new AbortController();
    const timeout = setTimeout(async () => {
      try {
        const response = await fetch(
          `/api/user/search?q=${encodeURIComponent(searchQuery.trim())}`,
          { signal: controller.signal }
        );
        if (!response.ok) {
          throw new Error("Failed to search users");
        }
        const data = await response.json();
        setSearchResults(data.users || []);
      } catch (error) {
        if ((error as Error).name === "AbortError") {
          return;
        }
        console.error("Search error:", error);
        toast.error("Failed to search users");
      } finally {
        setSearchLoading(false);
      }
    }, 300);

    return () => {
      clearTimeout(timeout);
      controller.abort();
    };
  }, [searchQuery, isNewChatOpen]);

  const canStartChat = (result: SearchResult) => {
    if (result.isPrivate) {
      return result.relationship === "FRIEND";
    }
    return true;
  };

  const canSendFriendRequest = (result: SearchResult) => {
    return result.relationship === "NONE";
  };

  const handleStartChat = async (targetUserId: number) => {
    setChattingUserId(targetUserId);
    try {
      const chat = await createChat(targetUserId);
      if (chat) {
        toast.success("Chat ready!");
        onSelectChat(chat.id);
        setIsNewChatOpen(false);
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to start chat");
    } finally {
      setChattingUserId(null);
    }
  };

  const handleSendFriendRequest = async (targetUserId: number) => {
    setRequestingUserId(targetUserId);
    const success = await sendFriendRequest(targetUserId);
    if (success) {
      toast.success("Friend request sent");
      setSearchResults((prev) =>
        prev.map((result) =>
          result.id === targetUserId ? { ...result, relationship: "OUTGOING_REQUEST" } : result
        )
      );
    } else {
      toast.error("Failed to send friend request");
    }
    setRequestingUserId(null);
  };

  return (
    <div className="flex flex-col h-full min-h-0 bg-white">
      <div className="flex-shrink-0 p-4 border-b border-slate-200 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-slate-900">Chats</h2>
        <Dialog open={isNewChatOpen} onOpenChange={setIsNewChatOpen}>
          <DialogTrigger asChild>
            <Button size="sm" variant="default" className="rounded-lg shadow-sm">
              + New
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-xl">
            <DialogHeader>
              <DialogTitle>Start a conversation</DialogTitle>
              <DialogDescription>
                Search for teammates, send friend requests, or open a chat.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by username or email"
                  className="pl-9"
                />
              </div>
              <div className="max-h-80 overflow-y-auto space-y-3 pr-1">
                {searchLoading ? (
                  <div className="text-center text-slate-400 py-8 text-sm">Searching users…</div>
                ) : searchResults.length === 0 ? (
                  <div className="text-center text-slate-400 py-8 text-sm">
                    {searchQuery.trim()
                      ? "No users found. Try another name or email."
                      : "Start typing to find people."}
                  </div>
                ) : (
                  searchResults.map((result) => {
                    const startChatDisabled = !canStartChat(result);
                    const requestDisabled = !canSendFriendRequest(result);
                    const isRequesting = requestingUserId === result.id;
                    const isStartingChat = chattingUserId === result.id;

                    return (
                      <div
                        key={result.id}
                        className="flex flex-col gap-2 border border-slate-200 rounded-xl p-4 bg-slate-50"
                      >
                        <div className="flex items-center gap-3">
                          <Avatar className="h-10 w-10">
                            <AvatarImage src={result.profilePic || undefined} alt={result.username} />
                            <AvatarFallback className="bg-[#04C99B]/20 text-[#007AFF] font-semibold">
                              {result.username.charAt(0).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <p className="font-semibold text-slate-900">{result.username}</p>
                            <p className="text-xs text-slate-500">{result.email}</p>
                            <div className="text-xs text-slate-500 flex items-center gap-1 mt-1">
                              {result.isPrivate ? (
                                <>
                                  <Shield className="w-3 h-3 text-amber-500" />
                                  Private profile
                                </>
                              ) : (
                                <>
                                  <Users className="w-3 h-3 text-emerald-500" />
                                  Public profile
                                </>
                              )}
                            </div>
                          </div>
                          <span
                            className={cn(
                              "text-xs font-medium px-2 py-1 rounded-full",
                              result.relationship === "FRIEND"
                                ? "bg-emerald-50 text-emerald-700"
                                : result.relationship === "OUTGOING_REQUEST"
                                  ? "bg-blue-50 text-blue-700"
                                  : result.relationship === "INCOMING_REQUEST"
                                    ? "bg-amber-50 text-amber-700"
                                    : "bg-slate-100 text-slate-600"
                            )}
                          >
                            {result.relationship === "FRIEND"
                              ? "Friends"
                              : result.relationship === "OUTGOING_REQUEST"
                                ? "Request sent"
                                : result.relationship === "INCOMING_REQUEST"
                                  ? "Incoming request"
                                  : "Not friends"}
                          </span>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <Button
                            variant={startChatDisabled ? "outline" : "default"}
                            disabled={startChatDisabled || isStartingChat}
                            onClick={() => handleStartChat(result.id)}
                          >
                            {isStartingChat ? "Starting…" : "Start Chat"}
                          </Button>
                          <Button
                            variant="outline"
                            disabled={requestDisabled || isRequesting}
                            onClick={() => handleSendFriendRequest(result.id)}
                          >
                            {isRequesting
                              ? "Sending…"
                              : requestDisabled
                                ? result.relationship === "FRIEND"
                                  ? "Already friends"
                                  : result.relationship === "OUTGOING_REQUEST"
                                    ? "Pending"
                                    : "Respond to request"
                                : "Add Friend"}
                          </Button>
                        </div>
                        {result.isPrivate && result.relationship !== "FRIEND" && (
                          <p className="text-xs text-amber-600">
                            This user is private. Become friends to start a chat.
                          </p>
                        )}
                        {!result.isPrivate && requestDisabled && result.relationship === "INCOMING_REQUEST" && (
                          <p className="text-xs text-slate-500">
                            Approve or decline this request from your profile.
                          </p>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex-1 min-h-0 overflow-y-auto p-3 space-y-2">
        {loading ? (
          <div className="text-center text-slate-400 py-12 text-sm">Loading chats...</div>
        ) : (
          <>
            {chats.map((chat) => {
              const otherUser = user ? getOtherUser(chat, user.id) : null;
              const displayName = otherUser?.username || "Unknown User";
              const lastMessage = chat.lastMessage;
              const lastMessageText = lastMessage?.messageText || "No messages yet";
              const unreadCount = chat.unreadCount || 0;
              const lastMessageTime = lastMessage
                ? formatDistanceToNowStrict(new Date(lastMessage.createdAt), { addSuffix: false })
                : null;
              const isLastMessageFromUser = lastMessage?.userId === user?.id;
              const otherUserId = otherUser?.id;
              const otherHasRead =
                !!lastMessage &&
                isLastMessageFromUser &&
                !!lastMessage.readReceipts?.some((receipt) => receipt.userId === otherUserId);

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
                  <div className="flex items-center gap-3">
                    <Avatar className="h-11 w-11">
                      <AvatarImage src={otherUser?.profilePic || undefined} alt={displayName} />
                      <AvatarFallback className="bg-[#04C99B]/15 text-[#007AFF] font-semibold">
                        {displayName.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className="font-semibold text-slate-900 truncate">{displayName}</p>
                        {lastMessageTime && (
                          <span className="text-[11px] text-slate-400 ml-2">{lastMessageTime}</span>
                        )}
                      </div>
                      <div className="flex items-center gap-1 text-sm text-slate-500 truncate">
                        {isLastMessageFromUser && (
                          <CheckCheck
                            className={cn(
                              "h-4 w-4",
                              otherHasRead ? "text-[#04C99B]" : "text-slate-400"
                            )}
                          />
                        )}
                        <span className="truncate">{lastMessageText}</span>
                      </div>
                    </div>
                    {unreadCount > 0 && (
                      <div className="bg-[#007AFF] text-white text-xs font-semibold rounded-full min-w-[24px] h-6 flex items-center justify-center">
                        {unreadCount}
                      </div>
                    )}
                  </div>
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
