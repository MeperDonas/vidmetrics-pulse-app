"use client";

import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  Radar,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import { Info } from "lucide-react";
import type { AnalysisSummary } from "@/types/analysis";
import {
  Tooltip as UITooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface PerformanceRadarProps {
  summary: AnalysisSummary;
  videos: Array<{ viewCount: number; likeCount: number; engagementRate: number }>;
}

function stddev(values: number[]): number {
  if (values.length < 2) return 0;
  const mean = values.reduce((s, v) => s + v, 0) / values.length;
  const variance =
    values.reduce((s, v) => s + Math.pow(v - mean, 2), 0) / values.length;
  return Math.sqrt(variance);
}

const DIMENSIONS: Array<{
  key: string;
  label: string;
  description: string;
  color: string;
}> = [
  {
    key: "Avg Views",
    label: "Avg Views",
    description: "How the channel's avg views compare against common benchmarks",
    color: "#6366f1",
  },
  {
    key: "Engagement",
    label: "Engagement",
    description: "Avg likes + comments per view, normalized to 0-100",
    color: "#8b5cf6",
  },
  {
    key: "Trending",
    label: "Trending",
    description: "% of videos above the channel's own baseline (Z-score ≥ 0.25)",
    color: "#10b981",
  },
  {
    key: "Consistency",
    label: "Consistency",
    description: "How stable view performance is — low variance scores higher",
    color: "#f59e0b",
  },
  {
    key: "Top Video",
    label: "Top Video",
    description: "Performance score of the channel's best video (0-100)",
    color: "#ef4444",
  },
];

export function PerformanceRadar({ summary, videos }: PerformanceRadarProps) {
  const avgViews = summary.averageViews;
  const avgEngagement = summary.averageEngagementRate;
  const trendingPct =
    videos.length > 0 ? (summary.trendingCount / videos.length) * 100 : 0;
  const consistency =
    videos.length > 1
      ? Math.max(
          0,
          100 -
            (stddev(videos.map((v) => v.viewCount)) / (avgViews || 1)) * 10
        )
      : 50;

  const data = [
    { subject: "Avg Views", value: Math.min(summary.overallScore, 100) },
    { subject: "Engagement", value: Math.min(avgEngagement * 10, 100) },
    { subject: "Trending", value: Math.round(trendingPct) },
    { subject: "Consistency", value: Math.round(consistency) },
    { subject: "Top Video", value: summary.topPerformer?.performanceScore ?? 0 },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between gap-2">
        <div>
          <h4 className="text-sm font-semibold text-foreground">Performance Profile</h4>
          <p className="text-xs text-muted-foreground mt-0.5">
            Five-dimension breakdown · all values normalized 0–100
          </p>
        </div>
        <TooltipProvider delay={200}>
          <UITooltip>
            <TooltipTrigger className="mt-0.5 shrink-0 text-muted-foreground/40 hover:text-muted-foreground transition-colors cursor-default" aria-label="About this chart">
              <Info className="h-3.5 w-3.5" />
            </TooltipTrigger>
            <TooltipContent side="left" align="start" className="max-w-[270px] p-0">
              <div className="p-3 space-y-2">
                <p className="font-semibold text-xs">Performance Profile</p>
                <p className="text-[11px] opacity-70 leading-relaxed">
                  Five-axis radar showing the channel's full performance profile, each axis normalized 0–100.
                </p>
                <div className="space-y-1.5 pt-0.5">
                  {[
                    { label: "Avg Views", desc: "Channel score benchmarked against view count tiers." },
                    { label: "Engagement", desc: "Likes + comments per view, normalized to 0–100." },
                    { label: "Trending", desc: "% of videos beating the channel's own baseline (Z-score ≥ 0.25)." },
                    { label: "Consistency", desc: "How stable view performance is — low variance scores higher." },
                    { label: "Top Video", desc: "Performance score of the channel's best video (0–100)." },
                  ].map(({ label, desc }) => (
                    <div key={label}>
                      <span className="text-[10px] font-semibold">{label}: </span>
                      <span className="text-[10px] opacity-60">{desc}</span>
                    </div>
                  ))}
                </div>
                <p className="text-[10px] opacity-40 pt-1 border-t border-current/15">
                  An ideal channel has the radar as close to the outer edge as possible.
                </p>
              </div>
            </TooltipContent>
          </UITooltip>
        </TooltipProvider>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-[1fr_auto] gap-4 items-center">
        <ResponsiveContainer width="100%" height={220}>
          <RadarChart data={data} margin={{ top: 10, right: 24, bottom: 10, left: 24 }}>
            <PolarGrid stroke="currentColor" className="text-border/50" />
            <PolarAngleAxis
              dataKey="subject"
              tick={{ fontSize: 11, fill: "currentColor" }}
              className="text-muted-foreground"
            />
            <Tooltip
              content={({ active, payload }) => {
                if (!active || !payload?.[0]) return null;
                const subject = payload[0].payload.subject as string;
                const value = payload[0].value as number;
                const dim = DIMENSIONS.find((d) => d.key === subject);
                return (
                  <div className="rounded-lg border border-border/60 bg-background/95 backdrop-blur-sm shadow-xl px-3 py-2.5 text-xs max-w-52">
                    <p className="font-semibold text-foreground">{subject}</p>
                    <p className="text-indigo-500 font-bold text-sm">{value}/100</p>
                    {dim && (
                      <p className="text-muted-foreground mt-1 leading-relaxed">
                        {dim.description}
                      </p>
                    )}
                  </div>
                );
              }}
            />
            <Radar
              dataKey="value"
              stroke="#6366f1"
              strokeWidth={2}
              fill="#6366f1"
              fillOpacity={0.15}
              dot={{ r: 3, fill: "#6366f1", strokeWidth: 0 }}
            />
          </RadarChart>
        </ResponsiveContainer>

        {/* Legend */}
        <div className="flex flex-col gap-2 sm:min-w-[180px] pr-2">
          {DIMENSIONS.map((dim) => {
            const point = data.find((d) => d.subject === dim.key);
            return (
              <div key={dim.key} className="flex items-center justify-between gap-3">
                <span className="text-xs text-muted-foreground truncate">{dim.label}</span>
                <span
                  className="text-xs font-bold tabular-nums shrink-0"
                  style={{ color: dim.color }}
                >
                  {point?.value ?? 0}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
