"use client";

import { AlertOctagon, CheckCircle, Clock, Layers } from "lucide-react";

interface StatsOverviewProps {
  total: number;
  pending: number;
  reviewed: number;
}

export default function StatsOverview({ total, pending, reviewed }: StatsOverviewProps) {
  const cards = [
    {
      label: "Total flagged",
      value: total,
      icon: Layers,
      color: "from-[#007AFF] to-[#04C99B]",
    },
    {
      label: "Pending",
      value: pending,
      icon: Clock,
      color: "from-amber-400 to-orange-500",
    },
    {
      label: "Reviewed",
      value: reviewed,
      icon: CheckCircle,
      color: "from-emerald-400 to-emerald-600",
    },
    {
      label: "Urgent",
      value: Math.max(0, pending - reviewed),
      icon: AlertOctagon,
      color: "from-rose-400 to-red-600",
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
      {cards.map((card) => (
        <div key={card.label} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <div
            className={`flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br ${card.color} text-white shadow-md shadow-black/10`}
          >
            <card.icon className="h-5 w-5" />
          </div>
          <p className="mt-3 text-xs font-semibold uppercase tracking-wide text-slate-500">{card.label}</p>
          <p className="text-2xl font-bold text-slate-900">{card.value}</p>
        </div>
      ))}
    </div>
  );
}
