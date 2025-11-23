"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useReportStore } from "@/stores/admin/useReportStore";

const statusOptions = ["PENDING", "REVIEWED", "CLOSED"] as const;

export default function ReportsPage() {
  const { reports, fetchReports, updateReportStatus } = useReportStore();

  useEffect(() => {
    fetchReports();
  }, [fetchReports]);

  return (
    <div className="space-y-4">
      <div>
        <p className="text-sm text-slate-500">Inbox</p>
        <h1 className="text-xl font-semibold text-slate-900">Reports</h1>
      </div>

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white/80 shadow-sm">
        <div className="grid grid-cols-12 bg-slate-50 px-4 py-3 text-xs font-semibold uppercase text-slate-500">
          <div className="col-span-3">Reporter</div>
          <div className="col-span-5">Message</div>
          <div className="col-span-2">Status</div>
          <div className="col-span-2 text-right">Actions</div>
        </div>
        <div className="divide-y divide-slate-100">
          {reports.map((report) => (
            <div key={report.id} className="grid grid-cols-12 items-center px-4 py-3 text-sm hover:bg-slate-50">
              <div className="col-span-3">
                <p className="font-semibold">User #{report.reporterId}</p>
                <p className="text-xs text-slate-500">Chat #{report.chatId}</p>
              </div>
              <div className="col-span-5">
                <p className="text-slate-800 line-clamp-2">{report.message}</p>
                <p className="text-xs text-slate-500 mt-1">{report.createdAt?.slice(0, 19).replace("T", " ")}</p>
              </div>
              <div className="col-span-2">
                <select
                  className="w-full rounded-lg border border-slate-200 bg-white px-2 py-1 text-sm"
                  value={report.status}
                  onChange={(e) => updateReportStatus(report.id, e.target.value as (typeof statusOptions)[number])}
                >
                  {statusOptions.map((status) => (
                    <option key={status} value={status}>
                      {status}
                    </option>
                  ))}
                </select>
              </div>
              <div className="col-span-2 flex justify-end">
                <Button variant="outline" size="sm">
                  View Chat
                </Button>
              </div>
            </div>
          ))}
          {reports.length === 0 && (
            <div className="px-4 py-6 text-sm text-slate-500">No reports yet.</div>
          )}
        </div>
      </div>
    </div>
  );
}
