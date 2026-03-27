"use client";

/**
 * GrowthTrend Chart
 *
 * Answers the most important competitor question:
 * "Is this channel growing, stagnating, or declining?"
 *
 * Approach: divide videos into 5 chronological groups (oldest → newest)
 * and show average views per group as a bar chart, with each bar colored
 * by its position (muted for old, primary for recent). A summary badge
 * shows the net change vs the previous cohort.
 */

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  ReferenceLine,
} from "recharts";
import { format } from "date-fns";
import { TrendingUp, TrendingDown, Minus, Info } from "lucide-react";
import type { VideoWithScore } from "@/types/video";
import type { GrowthTrend } from "@/types/analysis";
import { formatNumber } from "@/lib/utils";
import {
  Tooltip as UITooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface GrowthTrendProps {
  videos: VideoWithScore[];
  growthTrend: GrowthTrend;
}

const N_GROUPS = 5;

// Color scale: oldest (gray) → newest (indigo)
const GROUP_COLORS = [
  "#94a3b8",  // oldest — muted slate
  "#7c8fa8",
  "#6875b5",
  "#6366f1",  // newest — full indigo
  "#4f46e5",
];

export function GrowthTrendChart({ videos, growthTrend }: GrowthTrendProps) {
  // Sort oldest → newest
  const sorted = [...videos].sort(
    (a, b) => new Date(a.publishedAt).getTime() - new Date(b.publishedAt).getTime()
  );

  const groupSize = Math.ceil(sorted.length / N_GROUPS);
  const groups = Array.from({ length: N_GROUPS }, (_, i) => {
    const slice = sorted.slice(i * groupSize, (i + 1) * groupSize);
    if (slice.length === 0) return null;

    const avgViews = Math.round(
      slice.reduce((s, v) => s + v.viewCount, 0) / slice.length
    );
    const firstDate = format(new Date(slice[0].publishedAt), "MMM yyyy");
    const lastDate  = format(new Date(slice[slice.length - 1].publishedAt), "MMM yyyy");
    const dateRange = firstDate === lastDate ? firstDate : `${firstDate} – ${lastDate}`;

    return {
      label: i === 0 ? "Oldest" : i === N_GROUPS - 1 ? "Latest" : firstDate,
      dateRange,
      avgViews,
      count: slice.length,
      index: i,
    };
  }).filter((g): g is NonNullable<typeof g> => g !== null);

  const overallAvg = Math.round(
    groups.reduce((s, g) => s + g.avgViews, 0) / groups.length
  );

  const { direction, changePercent } = growthTrend;

  const TrendIcon =
    direction === "up"   ? TrendingUp   :
    direction === "down" ? TrendingDown : Minus;

  const trendColor =
    direction === "up"   ? "#059669" :
    direction === "down" ? "#dc2626" : "#94a3b8";

  const trendBg =
    direction === "up"   ? "#f0fdf4" :
    direction === "down" ? "#fef2f2" : "#f8fafc";

  const trendBorder =
    direction === "up"   ? "#bbf7d0" :
    direction === "down" ? "#fecaca" : "#e2e8f0";

  const trendLabel =
    direction === "up"   ? `+${changePercent}% recent trend` :
    direction === "down" ? `${changePercent}% recent trend`  : "Stable";

  return (
    <div className="space-y-3">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h4 className="text-sm font-semibold text-foreground">Channel Growth Trend</h4>
          <p className="text-xs text-muted-foreground mt-0.5">
            Avg views per video across {N_GROUPS} chronological groups · oldest → latest
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {/* Summary badge */}
          <div
            className="inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs font-semibold"
            style={{ background: trendBg, borderColor: trendBorder, color: trendColor }}
          >
            <TrendIcon className="h-3.5 w-3.5" />
            {trendLabel}
          </div>

          {/* Info tooltip */}
          <TooltipProvider delay={200}>
            <UITooltip>
              <TooltipTrigger className="text-muted-foreground/40 hover:text-muted-foreground transition-colors cursor-default" aria-label="About this chart">
                <Info className="h-3.5 w-3.5" />
              </TooltipTrigger>
              <TooltipContent side="left" align="start" className="max-w-[260px] p-0">
                <div className="p-3 space-y-2">
                  <p className="font-semibold text-xs">Channel Growth Trend</p>
                  <p className="text-[11px] opacity-70 leading-relaxed">
                    Splits videos into 5 chronological groups and compares the average views of each group.
                  </p>
                  <div className="space-y-1.5 pt-0.5">
                    {[
                      { label: "Taller bars on the right", desc: "The channel is growing — recent videos are getting more views." },
                      { label: "Dashed line", desc: "Overall channel average — the baseline reference." },
                      { label: "Gray → dark gradient", desc: "Left = oldest videos, right = most recent." },
                      { label: "Trend badge", desc: "Compares the latest group vs the previous one and shows the % change." },
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
      </div>

      <ResponsiveContainer width="100%" height={200}>
        <BarChart data={groups} margin={{ top: 8, right: 8, left: 0, bottom: 4 }}>
          <CartesianGrid
            strokeDasharray="3 3"
            vertical={false}
            stroke="currentColor"
            className="text-border/50"
          />
          <XAxis
            dataKey="label"
            tick={{ fontSize: 10, fill: "currentColor" }}
            tickLine={false}
            axisLine={false}
            className="text-muted-foreground"
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
              const d = payload[0].payload as (typeof groups)[0];
              return (
                <div className="rounded-lg border border-border/60 bg-background/95 backdrop-blur-sm shadow-xl px-3 py-2.5 text-xs space-y-1">
                  <p className="font-semibold text-foreground">{d.dateRange}</p>
                  <p className="text-muted-foreground">{d.count} videos in group</p>
                  <p className="font-bold text-indigo-500">{formatNumber(d.avgViews)} avg views</p>
                </div>
              );
            }}
          />
          <ReferenceLine
            y={overallAvg}
            stroke="#6366f1"
            strokeDasharray="5 4"
            strokeOpacity={0.4}
          />
          <Bar dataKey="avgViews" radius={[4, 4, 0, 0]} maxBarSize={48}>
            {groups.map((g, i) => (
              <Cell key={i} fill={GROUP_COLORS[g.index] ?? GROUP_COLORS[3]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>

      <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground/70">
        <span className="h-2 w-2 rounded-sm" style={{ background: GROUP_COLORS[0] }} />
        <span>Oldest videos</span>
        <span className="mx-1">→</span>
        <span className="h-2 w-2 rounded-sm" style={{ background: GROUP_COLORS[4] }} />
        <span>Most recent · dashed = overall avg ({formatNumber(overallAvg)} views)</span>
      </div>
    </div>
  );
}
