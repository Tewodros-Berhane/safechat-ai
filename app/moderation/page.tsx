"use client";

import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import FlaggedMessageList from "./components/FlaggedMessageList";
import MessageReviewPanel from "./components/MessageReviewPanel";
import ModeratorActions from "./components/ModeratorActions";
import TopBar from "./components/TopBar";
import ConnectionStatus, { type ConnectionState } from "./components/ConnectionStatus";
import StatsOverview from "./components/StatsOverview";
import { useModerationStore } from "@/stores/useModerationStore";
import { useShallow } from "zustand/react/shallow";

type ActionType = "approve" | "warn" | "mute" | "delete";

const WS_URL = process.env.NEXT_PUBLIC_MODERATION_WS || "wss://api.safechat.ai/moderation/stream";

export default function ModerationPage() {
  const { filters, flaggedMessages } = useModerationStore(
    useShallow((state) => ({ filters: state.filters, flaggedMessages: state.flaggedMessages }))
  );
  const selectedMessageId = useModerationStore((state) => state.selectedMessageId);
  const addFlaggedMessage = useModerationStore((state) => state.addFlaggedMessage);
  const selectMessage = useModerationStore((state) => state.selectMessage);
  const setCategoryFilter = useModerationStore((state) => state.setCategoryFilter);
  const setStatusFilter = useModerationStore((state) => state.setStatusFilter);
  const setSearch = useModerationStore((state) => state.setSearch);
  const markMessageStatus = useModerationStore((state) => state.markMessageStatus);
  const updateNotes = useModerationStore((state) => state.updateNotes);
  const getFilteredMessages = useModerationStore((state) => state.getFilteredMessages);
  const getStats = useModerationStore((state) => state.getStats);

  const filteredMessages = useMemo(
    () => getFilteredMessages(),
    [getFilteredMessages, filters, flaggedMessages]
  );
  const stats = useMemo(() => getStats(), [getStats, flaggedMessages]);
  const selectedMessage = useMemo(
    () => flaggedMessages.find((message) => message.messageId === selectedMessageId) ?? null,
    [flaggedMessages, selectedMessageId]
  );

  const [connectionStatus, setConnectionStatus] = useState<ConnectionState>("connecting");
  const [currentAction, setCurrentAction] = useState<ActionType | null>(null);
  const [lastEventAt, setLastEventAt] = useState<string | null>(null);

  useEffect(() => {
    if (!selectedMessage && filteredMessages.length > 0) {
      selectMessage(filteredMessages[0].messageId);
    }
  }, [filteredMessages, selectMessage, selectedMessage]);

  useEffect(() => {
    let ws: WebSocket | null = null;
    let reconnectTimer: ReturnType<typeof setTimeout> | null = null;

    const connect = () => {
      try {
        ws = new WebSocket(WS_URL);
      } catch (error) {
        console.error("Failed to open moderation websocket", error);
        setConnectionStatus("disconnected");
        return;
      }

      setConnectionStatus("connecting");

      ws.onopen = () => setConnectionStatus("connected");
      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          addFlaggedMessage(data);
          setLastEventAt(new Date().toISOString());
        } catch (error) {
          console.error("Failed to parse moderation event", error);
        }
      };
      ws.onerror = () => {
        setConnectionStatus("disconnected");
        ws?.close();
      };
      ws.onclose = () => {
        setConnectionStatus("disconnected");
        reconnectTimer = setTimeout(connect, 3500);
      };
    };

    connect();

    return () => {
      if (reconnectTimer) {
        clearTimeout(reconnectTimer);
      }
      ws?.close();
    };
  }, [addFlaggedMessage]);

  const handleAction = async (action: ActionType, payload?: { duration?: string }) => {
    if (!selectedMessage) {
      return;
    }
    setCurrentAction(action);
    try {
      const baseHeaders = { "Content-Type": "application/json" };
      let endpoint = "";
      let body: Record<string, unknown> = {};

      switch (action) {
        case "approve":
          endpoint = "/api/moderation/approve";
          body = { messageId: selectedMessage.messageId };
          break;
        case "warn":
          endpoint = "/api/moderation/warn";
          body = {
            userId: selectedMessage.senderId ?? selectedMessage.messageId,
            reason: selectedMessage.notes || "Moderator warning issued from dashboard",
          };
          break;
        case "mute":
          endpoint = "/api/moderation/mute";
          body = {
            userId: selectedMessage.senderId ?? selectedMessage.messageId,
            duration: payload?.duration ?? "1h",
          };
          break;
        case "delete":
          endpoint = "/api/moderation/delete";
          body = { messageId: selectedMessage.messageId };
          break;
        default:
          break;
      }

      const response = await fetch(endpoint, {
        method: "POST",
        headers: baseHeaders,
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        throw new Error(`Failed to ${action} message`);
      }

      markMessageStatus(selectedMessage.messageId, "reviewed");
      toast.success(
        action === "approve"
          ? "Message approved and marked as safe."
          : action === "warn"
            ? "User warned successfully."
            : action === "mute"
              ? "User muted."
              : "Message deleted."
      );
    } catch (error) {
      console.error(error);
      toast.error(error instanceof Error ? error.message : "Unable to complete moderation action");
    } finally {
      setCurrentAction(null);
    }
  };

  return (
    <main className="min-h-screen w-screen bg-[#F9FAFB] px-4 py-6">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-4">
        <TopBar pendingCount={stats.pending} />

        <StatsOverview total={stats.total} pending={stats.pending} reviewed={stats.reviewed} />

        <div className="grid grid-cols-1 gap-4 xl:grid-cols-5">
          <div className="xl:col-span-2">
            <FlaggedMessageList
              messages={filteredMessages}
              selectedMessageId={selectedMessageId}
              filters={filters}
              onSelect={selectMessage}
              onChangeFilters={(nextFilters) => {
                if (typeof nextFilters.category !== "undefined") setCategoryFilter(nextFilters.category);
                if (typeof nextFilters.status !== "undefined") setStatusFilter(nextFilters.status);
                if (typeof nextFilters.search !== "undefined") setSearch(nextFilters.search);
              }}
            />
          </div>

          <div className="xl:col-span-3">
            <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
              <div className="xl:col-span-2 min-h-[620px]">
                <MessageReviewPanel message={selectedMessage} />
              </div>
              <div className="xl:col-span-1 min-h-[620px]">
                <ModeratorActions
                  message={selectedMessage}
                  notes={selectedMessage?.notes ?? ""}
                  onNotesChange={(value) => selectedMessage && updateNotes(selectedMessage.messageId, value)}
                  onAction={handleAction}
                  currentAction={currentAction}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <ConnectionStatus status={connectionStatus} lastEventAt={lastEventAt} />
    </main>
  );
}
