"use client";

/**
 * ContentBreakdown Chart
 *
 * Answers: "Which content format drives the most performance for this channel?"
 *
 * Groups videos by duration into 4 buckets:
 *   Shorts     < 1 min
 *   Short-form 1–5 min
 *   Medium     5–15 min
 *   Long-form  > 15 min
 *
 * Shows avg views (bars) + avg engagement rate (dot/line) per bucket,
 * with a count badge so you know sample size.
 */

import {
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { Info } from "lucide-react";
import type { ContentBucket } from "@/types/analysis";
import { formatNumber } from "@/lib/utils";
import {
  Tooltip as UITooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface ContentBreakdownProps {
  contentBreakdown: ContentBucket[];
}

// One distinct color per bucket
const BUCKET_COLORS: Record<string, string> = {
  "Shorts":     "#f59e0b",
  "Short-form": "#10b981",
  "Medium":     "#6366f1",
  "Long-form":  "#8b5cf6",
};

function fallbackColor(i: number): string {
  const defaults = ["#6366f1", "#10b981", "#f59e0b", "#8b5cf6"];
  return defaults[i % defaults.length];
}

export function ContentBreakdown({ contentBreakdown }: ContentBreakdownProps) {
  if (contentBreakdown.length === 0) return null;

  const data = contentBreakdown.map((b) => ({
    ...b,
    engagementDisplay: parseFloat(b.avgEngagement.toFixed(2)),
  }));

  const bestViews      = [...data].sort((a, b) => b.avgViews - a.avgViews)[0];
  const bestEngagement = [...data].sort((a, b) => b.avgEngagement - a.avgEngagement)[0];

  return (
    <div className="space-y-3">
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div>
          <h4 className="text-sm font-semibold text-foreground">Content Format Analysis</h4>
          <p className="text-xs text-muted-foreground mt-0.5">
            Performance breakdown by video duration · bars = avg views · line = engagement %
          </p>
        </div>

        <div className="flex items-start gap-2">
          {/* Best-performer callouts */}
          <div className="flex items-center gap-2 flex-wrap">
            <Callout
              label="Best views"
              value={bestViews.label}
              color={BUCKET_COLORS[bestViews.label] ?? fallbackColor(0)}
            />
            {bestEngagement.label !== bestViews.label && (
              <Callout
                label="Best engagement"
                value={bestEngagement.label}
                color={BUCKET_COLORS[bestEngagement.label] ?? fallbackColor(1)}
              />
            )}
          </div>

          {/* Info tooltip — top-right, same position as all other charts */}
          <TooltipProvider delay={200}>
            <UITooltip>
              <TooltipTrigger className="text-muted-foreground/40 hover:text-muted-foreground transition-colors cursor-default" aria-label="About this chart">
                <Info className="h-3.5 w-3.5" />
              </TooltipTrigger>
              <TooltipContent side="left" align="start" className="max-w-[270px] p-0">
                <div className="p-3 space-y-2">
                  <p className="font-semibold text-xs">Content Format Analysis</p>
                  <p className="text-[11px] opacity-70 leading-relaxed">
                    Groups videos into 4 duration buckets and compares their average performance.
                  </p>
                  <div className="space-y-1.5 pt-0.5">
                    {[
                      { label: "Bars (left axis)", desc: "Avg views per format — which one pulls the most audience." },
                      { label: "Line (right axis)", desc: "Avg engagement rate — which one drives the most interaction." },
                      { label: "Shorts", desc: "< 1 min. High engagement but more volatile view counts." },
                      { label: "Short-form", desc: "1–5 min. Sweet spot for retention and reach." },
                      { label: "Medium / Long-form", desc: "5–15 min and 15+ min. Deeper content, more loyal audience." },
                    ].map(({ label, desc }) => (
                      <div key={label}>
                        <span className="text-[10px] font-semibold">{label}: </span>
                        <span className="text-[10px] opacity-60">{desc}</span>
                      </div>
                    ))}
                  </div>
                  <p className="text-[10px] opacity-40 pt-1 border-t border-current/15">
                    If the line rises where bars drop, that format hooks the audience despite fewer views.
                  </p>
                </div>
              </TooltipContent>
            </UITooltip>
          </TooltipProvider>
        </div>
      </div>

      <ResponsiveContainer width="100%" height={200}>
        <ComposedChart data={data} margin={{ top: 8, right: 36, left: 0, bottom: 4 }}>
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
          {/* Left Y — avg views */}
          <YAxis
            yAxisId="views"
            tickFormatter={(v) => formatNumber(v as number)}
            tick={{ fontSize: 10, fill: "currentColor" }}
            tickLine={false}
            axisLine={false}
            width={44}
            className="text-muted-foreground"
          />
          {/* Right Y — engagement % */}
          <YAxis
            yAxisId="engagement"
            orientation="right"
            tickFormatter={(v) => `${(v as number).toFixed(1)}%`}
            tick={{ fontSize: 10, fill: "currentColor" }}
            tickLine={false}
            axisLine={false}
            width={36}
            className="text-muted-foreground"
          />
          <Tooltip
            content={({ active, payload }) => {
              if (!active || !payload?.length) return null;
              const d = payload[0].payload as (typeof data)[0];
              return (
                <div className="rounded-lg border border-border/60 bg-background/95 backdrop-blur-sm shadow-xl px-3 py-2.5 text-xs space-y-1.5">
                  <div className="flex items-center gap-1.5">
                    <span
                      className="h-2.5 w-2.5 rounded-sm"
                      style={{ background: BUCKET_COLORS[d.label] ?? "#6366f1" }}
                    />
                    <span className="font-semibold text-foreground">
                      {d.label} <span className="text-muted-foreground font-normal">({d.durationRange})</span>
                    </span>
                  </div>
                  <p className="text-muted-foreground">{d.count} video{d.count !== 1 ? "s" : ""}</p>
                  <p className="font-bold" style={{ color: BUCKET_COLORS[d.label] ?? "#6366f1" }}>
                    {formatNumber(d.avgViews)} avg views
                  </p>
                  <p className="text-amber-500 font-semibold">
                    {d.avgEngagement.toFixed(2)}% avg engagement
                  </p>
                  <p className="text-muted-foreground">
                    Avg score: <span className="font-semibold text-foreground">{d.avgScore}/100</span>
                  </p>
                </div>
              );
            }}
          />
          <Bar yAxisId="views" dataKey="avgViews" radius={[4, 4, 0, 0]} maxBarSize={56}>
            {data.map((d, i) => (
              <Cell
                key={i}
                fill={BUCKET_COLORS[d.label] ?? fallbackColor(i)}
                fillOpacity={0.85}
              />
            ))}
          </Bar>
          <Line
            yAxisId="engagement"
            type="monotone"
            dataKey="engagementDisplay"
            stroke="#f59e0b"
            strokeWidth={2}
            dot={{ r: 4, fill: "#f59e0b", stroke: "#fff", strokeWidth: 2 }}
            activeDot={{ r: 5 }}
          />
        </ComposedChart>
      </ResponsiveContainer>

      {/* Bucket legend with sample sizes */}
      <div className="flex flex-wrap gap-3">
        {data.map((d, i) => (
          <div key={d.label} className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
            <span
              className="h-2 w-2 rounded-sm"
              style={{ background: BUCKET_COLORS[d.label] ?? fallbackColor(i) }}
            />
            <span className="font-medium text-foreground">{d.label}</span>
            <span>({d.durationRange})</span>
            <span className="text-muted-foreground/60">· {d.count} videos</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function Callout({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div
      className="inline-flex items-center gap-1.5 rounded-lg border px-2 py-1 text-[10px] font-medium"
      style={{
        borderColor: `${color}33`,
        background: `${color}0f`,
        color,
      }}
    >
      <span className="h-1.5 w-1.5 rounded-full" style={{ background: color }} />
      {label}: <span className="font-bold">{value}</span>
    </div>
  );
}
