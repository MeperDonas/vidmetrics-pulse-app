"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { Info } from "lucide-react";
import type { VideoWithScore } from "@/types/video";
import {
  Tooltip as UITooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface EngagementBreakdownProps {
  videos: VideoWithScore[];
}

function truncate(s: string, max = 22): string {
  return s.length > max ? s.slice(0, max) + "…" : s;
}

export function EngagementBreakdown({ videos }: EngagementBreakdownProps) {
  const top10 = [...videos]
    .sort((a, b) => b.engagementRate - a.engagementRate)
    .slice(0, 10)
    .map((v, i) => ({
      name: truncate(v.title),
      rate: parseFloat(v.engagementRate.toFixed(2)),
      rank: i + 1,
    }));

  const maxRate = Math.max(...top10.map((d) => d.rate), 0.01);

  return (
    <div className="space-y-3">
      <div className="flex items-start justify-between gap-2">
        <div>
          <h4 className="text-sm font-semibold text-foreground">Top 10 by Engagement</h4>
          <p className="text-xs text-muted-foreground mt-0.5">
            Engagement rate = (likes + comments) ÷ views · top 10 videos
          </p>
        </div>
        <TooltipProvider delay={200}>
          <UITooltip>
            <TooltipTrigger className="mt-0.5 shrink-0 text-muted-foreground/40 hover:text-muted-foreground transition-colors cursor-default" aria-label="About this chart">
              <Info className="h-3.5 w-3.5" />
            </TooltipTrigger>
            <TooltipContent side="left" align="start" className="max-w-[260px] p-0">
              <div className="p-3 space-y-2">
                <p className="font-semibold text-xs">Top 10 by Engagement</p>
                <p className="text-[11px] opacity-70 leading-relaxed">
                  The 10 videos with the highest engagement rate — shows which content drove the most real audience interaction.
                </p>
                <div className="space-y-1.5 pt-0.5">
                  {[
                    { label: "Formula", desc: "(likes + comments) ÷ views × 100" },
                    { label: "Longer bars", desc: "Videos that converted views into concrete actions (likes, comments)." },
                    { label: "Color intensity", desc: "#1 is the most saturated; gradually fades toward #10." },
                  ].map(({ label, desc }) => (
                    <div key={label}>
                      <span className="text-[10px] font-semibold">{label}: </span>
                      <span className="text-[10px] opacity-60">{desc}</span>
                    </div>
                  ))}
                </div>
                <p className="text-[10px] opacity-40 pt-1 border-t border-current/15">
                  High engagement with low views signals a very loyal audience.
                </p>
              </div>
            </TooltipContent>
          </UITooltip>
        </TooltipProvider>
      </div>

      <ResponsiveContainer width="100%" height={220}>
        <BarChart
          data={top10}
          layout="vertical"
          margin={{ top: 4, right: 12, left: 4, bottom: 4 }}
        >
          <CartesianGrid
            strokeDasharray="3 3"
            horizontal={false}
            stroke="currentColor"
            className="text-border/50"
          />
          <XAxis
            type="number"
            tickFormatter={(v) => `${(v as number).toFixed(1)}%`}
            tick={{ fontSize: 10, fill: "currentColor" }}
            tickLine={false}
            axisLine={false}
            className="text-muted-foreground"
            domain={[0, maxRate * 1.1]}
          />
          <YAxis
            type="category"
            dataKey="name"
            tick={{ fontSize: 10, fill: "currentColor" }}
            tickLine={false}
            axisLine={false}
            width={118}
            className="text-muted-foreground"
          />
          <Tooltip
            content={({ active, payload }) => {
              if (!active || !payload?.[0]) return null;
              const d = payload[0].payload as {
                name: string;
                rate: number;
                rank: number;
              };
              return (
                <div className="rounded-lg border border-border/60 bg-background/95 backdrop-blur-sm shadow-xl px-3 py-2.5 text-xs">
                  <p className="font-semibold text-foreground mb-1">
                    #{d.rank} {d.name}
                  </p>
                  <p className="text-violet-500 font-bold">
                    {d.rate.toFixed(2)}% engagement rate
                  </p>
                </div>
              );
            }}
          />
          <Bar dataKey="rate" radius={[0, 4, 4, 0]} maxBarSize={14}>
            {top10.map((_, i) => (
              <Cell key={i} fill={`rgba(139,92,246,${1 - i * 0.08})`} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
