"use client";

import { ReactNode } from "react";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface StatCardProps {
  title: string;
  value: string | number;
  hint?: string;
  icon?: ReactNode;
  tone?: "blue" | "green" | "slate" | "orange";
}

const toneStyles: Record<NonNullable<StatCardProps["tone"]>, string> = {
  blue: "bg-blue-50 text-blue-700 ring-1 ring-blue-100",
  green: "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100",
  slate: "bg-slate-100 text-slate-700 ring-1 ring-slate-200",
  orange: "bg-amber-50 text-amber-700 ring-1 ring-amber-100",
};

export function StatCard({ title, value, hint, icon, tone = "blue" }: StatCardProps) {
  return (
    <Card className="p-5 bg-white/80 backdrop-blur-sm border-slate-200 shadow-sm hover:shadow-md transition-shadow duration-150">
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-2">
          <p className="text-xs uppercase tracking-wide text-slate-500 font-semibold">{title}</p>
          <div className="flex items-baseline gap-2">
            <p className="text-3xl font-semibold text-slate-900">{value}</p>
            {hint && <span className={cn("text-xs px-2 py-1 rounded-full", toneStyles[tone])}>{hint}</span>}
          </div>
        </div>
        {icon && (
          <div className="h-10 w-10 rounded-2xl bg-gradient-to-br from-slate-900 to-slate-700 text-white flex items-center justify-center shadow">
            {icon}
          </div>
        )}
      </div>
    </Card>
  );
}
