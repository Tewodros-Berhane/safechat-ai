"use client";

import { Card } from "@/components/ui/card";

type ChartPoint = { name: string; value: number };

interface ChartCardProps {
  title: string;
  description?: string;
  data: ChartPoint[];
  accent?: string;
}

export function ChartCard({
  title,
  description,
  data,
  accent = "#007AFF",
}: ChartCardProps) {
  const maxValue = data.reduce((max, point) => Math.max(max, point.value), 0) || 1;
  const points = data
    .map((point, idx) => {
      const x = (idx / Math.max(data.length - 1, 1)) * 100;
      const y = 100 - (point.value / maxValue) * 100;
      return `${x},${y}`;
    })
    .join(" ");

  return (
    <Card className="p-5 bg-white/80 backdrop-blur-sm border-slate-200 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div>
          <p className="text-sm font-semibold text-slate-800">{title}</p>
          {description && <p className="text-xs text-slate-500">{description}</p>}
        </div>
        <span className="h-2 w-2 rounded-full" style={{ backgroundColor: accent }} />
      </div>
      <div className="h-36">
        <svg viewBox="0 0 100 100" className="h-full w-full" preserveAspectRatio="none">
          <defs>
            <linearGradient id="chartGradient" x1="0" x2="0" y1="0" y2="1">
              <stop offset="0%" stopColor={accent} stopOpacity={0.3} />
              <stop offset="100%" stopColor={accent} stopOpacity={0.05} />
            </linearGradient>
          </defs>
          <polyline
            fill="url(#chartGradient)"
            stroke={accent}
            strokeWidth="2"
            points={`0,100 ${points} 100,100`}
          />
        </svg>
        <div className="grid grid-cols-4 gap-2 text-[11px] text-slate-500 pt-2">
          {data.slice(0, 4).map((point) => (
            <div key={point.name} className="flex items-center justify-between">
              <span>{point.name}</span>
              <span className="font-semibold text-slate-700">{point.value}</span>
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
}
