"use client";

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
  ResponsiveContainer,
} from "recharts";
import { format } from "date-fns";
import { Info } from "lucide-react";
import type { VideoWithScore } from "@/types/video";
import { formatNumber } from "@/lib/utils";
import {
  Tooltip as UITooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface ViewsOverTimeProps {
  videos: VideoWithScore[];
  averageViews: number;
}

export function ViewsOverTime({ videos, averageViews }: ViewsOverTimeProps) {
  const data = [...videos]
    .sort(
      (a, b) =>
        new Date(a.publishedAt).getTime() - new Date(b.publishedAt).getTime()
    )
    .map((v) => ({
      date: format(new Date(v.publishedAt), "MMM d"),
      views: v.viewCount,
      title: v.title.length > 40 ? v.title.slice(0, 40) + "…" : v.title,
    }));

  return (
    <div className="space-y-3">
      <div className="flex items-start justify-between gap-2">
        <div>
          <h4 className="text-sm font-semibold text-foreground">Views Over Time</h4>
          <p className="text-xs text-muted-foreground mt-0.5">
            View count trend across {videos.length} videos · dashed = channel avg
          </p>
        </div>
        <TooltipProvider delay={200}>
          <UITooltip>
            <TooltipTrigger className="mt-0.5 shrink-0 text-muted-foreground/40 hover:text-muted-foreground transition-colors cursor-default" aria-label="About this chart">
              <Info className="h-3.5 w-3.5" />
            </TooltipTrigger>
            <TooltipContent side="left" align="start" className="max-w-[260px] p-0">
              <div className="p-3 space-y-2">
                <p className="font-semibold text-xs">Views Over Time</p>
                <p className="text-[11px] opacity-70 leading-relaxed">
                  Each point is a published video, ordered chronologically from left to right.
                </p>
                <div className="space-y-1.5 pt-0.5">
                  {[
                    { label: "Shaded area", desc: "View volume over time — the higher, the better." },
                    { label: "Dashed line", desc: "Channel average. Videos above it outperform the baseline." },
                    { label: "Sharp spikes", desc: "Viral moments — a video that far exceeded the norm." },
                  ].map(({ label, desc }) => (
                    <div key={label}>
                      <span className="text-[10px] font-semibold">{label}: </span>
                      <span className="text-[10px] opacity-60">{desc}</span>
                    </div>
                  ))}
                </div>
              </div>
            </TooltipContent>
          </UITooltip>
        </TooltipProvider>
      </div>

      <ResponsiveContainer width="100%" height={220}>
        <AreaChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 4 }}>
          <defs>
            <linearGradient id="viewsGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#6366f1" stopOpacity={0.25} />
              <stop offset="95%" stopColor="#6366f1" stopOpacity={0.02} />
            </linearGradient>
          </defs>

          <CartesianGrid
            strokeDasharray="3 3"
            stroke="currentColor"
            className="text-border/50"
            vertical={false}
          />
          <XAxis
            dataKey="date"
            tick={{ fontSize: 10, fill: "currentColor" }}
            tickLine={false}
            axisLine={false}
            className="text-muted-foreground"
            interval="preserveStartEnd"
          />
          <YAxis
            tickFormatter={(v) => formatNumber(v as number)}
            tick={{ fontSize: 10, fill: "currentColor" }}
            tickLine={false}
            axisLine={false}
            width={44}
            className="text-muted-foreground"
          />
          <Tooltip
            content={({ active, payload }) => {
              if (!active || !payload?.[0]) return null;
              const d = payload[0].payload as {
                date: string;
                views: number;
                title: string;
              };
              return (
                <div className="rounded-lg border border-border/60 bg-background/95 backdrop-blur-sm shadow-xl px-3 py-2.5 text-xs max-w-52">
                  <p className="font-semibold text-foreground leading-snug mb-1">
                    {d.title}
                  </p>
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-muted-foreground">{d.date}</span>
                    <span className="font-bold text-indigo-500">
                      {formatNumber(d.views)} views
                    </span>
                  </div>
                </div>
              );
            }}
          />
          <ReferenceLine
            y={averageViews}
            stroke="#6366f1"
            strokeDasharray="5 4"
            strokeOpacity={0.45}
          />
          <Area
            type="monotone"
            dataKey="views"
            stroke="#6366f1"
            strokeWidth={2}
            fill="url(#viewsGrad)"
            dot={false}
            activeDot={{ r: 4, fill: "#6366f1", stroke: "#fff", strokeWidth: 2 }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
