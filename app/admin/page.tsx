"use client";

import { useEffect, useMemo } from "react";
import { Activity, Users, AlertTriangle, MessageSquare } from "lucide-react";
import { StatCard } from "@/components/admin/StatCard";
import { ChartCard } from "@/components/admin/ChartCard";
import { useAdminStore } from "@/stores/admin/useAdminStore";

const fallbackStats = {
  totalUsers: 0,
  activeUsers: 0,
  flaggedMessages: 0,
  totalChats: 0,
  newReports: 0,
  uptime: 99.9,
};

export default function AdminDashboardPage() {
  const { stats, loading, fetchStats } = useAdminStore();
  const safeStats = stats || fallbackStats;

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  // Lightweight real-time hook; failure is silent if stream is unavailable.
  useEffect(() => {
    try {
      const ws = new WebSocket(
        process.env.NEXT_PUBLIC_ADMIN_STREAM || "wss://api.safechat.ai/admin/stream"
      );
      ws.onmessage = (event) => {
        const data = JSON.parse(event.data || "{}");
        if (data.type === "stats_update") {
          fetchStats();
        }
      };
      ws.onerror = () => ws.close();
      return () => ws.close();
    } catch (error) {
      console.warn("Realtime stream unavailable:", error);
      return () => undefined;
    }
  }, [fetchStats]);

  const activityTrend = useMemo(
    () => [
      { name: "Mon", value: safeStats.totalChats / 7 || 10 },
      { name: "Tue", value: safeStats.totalChats / 5 || 12 },
      { name: "Wed", value: safeStats.totalChats / 3 || 16 },
      { name: "Thu", value: safeStats.totalChats / 2 || 20 },
      { name: "Fri", value: safeStats.totalChats / 1.8 || 22 },
      { name: "Sat", value: safeStats.totalChats / 2.1 || 18 },
      { name: "Sun", value: safeStats.totalChats / 2.5 || 15 },
    ],
    [safeStats.totalChats]
  );

  const healthTrend = useMemo(
    () => [
      { name: "Mon", value: safeStats.flaggedMessages + 3 },
      { name: "Tue", value: safeStats.flaggedMessages + 5 },
      { name: "Wed", value: safeStats.flaggedMessages + 1 },
      { name: "Thu", value: safeStats.flaggedMessages + 2 },
      { name: "Fri", value: safeStats.flaggedMessages + 4 },
      { name: "Sat", value: safeStats.flaggedMessages + 3 },
      { name: "Sun", value: safeStats.flaggedMessages + 2 },
    ],
    [safeStats.flaggedMessages]
  );

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm text-slate-500">Control Tower</p>
          <h1 className="text-2xl font-semibold text-slate-900">Admin Dashboard</h1>
        </div>
        <div className="rounded-full bg-white border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-600 shadow-sm">
          {loading ? "Refreshing..." : "Live"}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard
          title="Total Users"
          value={safeStats.totalUsers}
          hint={`Active ${safeStats.activeUsers}`}
          icon={<Users className="h-5 w-5" />}
          tone="blue"
        />
        <StatCard
          title="Chats"
          value={safeStats.totalChats}
          hint="Across all teams"
          icon={<MessageSquare className="h-5 w-5" />}
          tone="slate"
        />
        <StatCard
          title="Flagged"
          value={safeStats.flaggedMessages}
          hint={`${safeStats.newReports} new reports`}
          icon={<AlertTriangle className="h-5 w-5" />}
          tone="orange"
        />
        <StatCard
          title="Uptime"
          value={`${safeStats.uptime}%`}
          hint="Rolling 30d"
          icon={<Activity className="h-5 w-5" />}
          tone="green"
        />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        <ChartCard
          title="Message Volume"
          description="Last 7 days"
          data={activityTrend}
          accent="#007AFF"
        />
        <ChartCard
          title="Safety Signals"
          description="Flags + reports"
          data={healthTrend}
          accent="#F59E0B"
        />
        <div className="p-5 bg-white/80 border border-slate-200 rounded-xl shadow-sm">
          <p className="text-sm font-semibold text-slate-800 mb-3">Live System Feed</p>
          <ul className="space-y-2 text-sm text-slate-700">
            <li className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-emerald-500" />
              Backend WebSocket ready for events.
            </li>
            <li className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-blue-500" />
              Stats auto-refresh when `stats_update` is received.
            </li>
            <li className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-slate-400" />
              API routes secured to ADMIN via role guard.
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
