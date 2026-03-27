import { TrendingUp, Eye, Heart, Zap, Info, TrendingDown, Minus } from "lucide-react";
import type { AnalysisSummary } from "@/types/analysis";
import { formatNumber, scoreColor } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface ChannelStatsProps {
  summary: AnalysisSummary;
}

export function ChannelStats({ summary }: ChannelStatsProps) {
  const { growthTrend } = summary;

  const GrowthIcon =
    growthTrend.direction === "up"   ? TrendingUp   :
    growthTrend.direction === "down" ? TrendingDown : Minus;

  const growthColor =
    growthTrend.direction === "up"   ? "text-emerald-500" :
    growthTrend.direction === "down" ? "text-red-500"     : "text-muted-foreground";

  const growthLabel =
    growthTrend.direction === "up"
      ? `+${growthTrend.changePercent}% recent`
      : growthTrend.direction === "down"
      ? `${growthTrend.changePercent}% recent`
      : "Stable";

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">

      {/* Avg Views — includes growth trend badge */}
      <TooltipProvider delay={200}>
        <Tooltip>
          <TooltipTrigger className="rounded-xl border border-border/60 bg-card p-4 sm:p-5 card-surface text-left w-full cursor-default">
            <div className="flex items-start justify-between mb-3">
              <div className="rounded-lg p-2 bg-blue-500/10 text-blue-500">
                <Eye className="h-4 w-4" />
              </div>
              {growthTrend.cohortSize > 0 && (
                <span className={`inline-flex items-center gap-0.5 text-[10px] font-semibold ${growthColor}`}>
                  <GrowthIcon className="h-3 w-3" />
                  {growthLabel}
                </span>
              )}
            </div>
            <p className="text-2xl font-extrabold tracking-tight text-foreground">
              {formatNumber(summary.averageViews)}
            </p>
            <p className="text-xs font-medium text-muted-foreground mt-0.5 leading-relaxed">
              Avg Views / Video
            </p>
            <p className="text-[11px] text-muted-foreground/70 mt-0.5">
              {summary.totalVideosAnalyzed} videos analyzed
            </p>
          </TooltipTrigger>
          <TooltipContent side="bottom" align="start" className="max-w-[260px] p-0">
            <div className="p-3 space-y-1.5">
              <p className="font-semibold text-xs">Growth Trend</p>
              <p className="opacity-70 text-[11px] leading-relaxed">
                Comparing the {growthTrend.cohortSize} most recent videos
                ({formatNumber(growthTrend.recentAvgViews)} avg views) against the
                previous {growthTrend.cohortSize} videos ({formatNumber(growthTrend.olderAvgViews)} avg views).
              </p>
            </div>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>

      {/* Avg Engagement */}
      <StatCard
        icon={<Heart className="h-4 w-4" />}
        iconBg="bg-rose-500/10 text-rose-500"
        label="Avg Engagement"
        value={`${summary.averageEngagementRate.toFixed(2)}%`}
        sub="Likes + comments / views"
      />

      {/* Trending Videos */}
      <StatCard
        icon={<TrendingUp className="h-4 w-4" />}
        iconBg="bg-emerald-500/10 text-emerald-500"
        label="Trending Videos"
        value={String(summary.trendingCount)}
        sub={
          summary.shortsCount > 0
            ? `Above baseline · ${summary.shortsCount} Shorts`
            : "Above channel baseline"
        }
      />

      {/* Channel Score with methodology tooltip */}
      <TooltipProvider delay={200}>
        <Tooltip>
          <TooltipTrigger className="rounded-xl border border-border/60 bg-card p-4 sm:p-5 card-surface text-left w-full cursor-default">
            <div className="flex items-start justify-between mb-3">
              <div className="rounded-lg p-2 bg-amber-500/10 text-amber-500">
                <Zap className="h-4 w-4" />
              </div>
              <Info className="h-3.5 w-3.5 text-muted-foreground/40 mt-0.5" />
            </div>
            <p className={`text-2xl font-extrabold tracking-tight ${scoreColor(summary.overallScore)}`}>
              {summary.overallScore}/100
            </p>
            <p className="text-xs font-medium text-muted-foreground mt-0.5 leading-relaxed">
              Channel Score
            </p>
            <p className="text-[11px] text-muted-foreground/70 mt-0.5">
              Composite performance
            </p>
          </TooltipTrigger>

          <TooltipContent side="bottom" align="end" className="max-w-[280px] p-0">
            <div className="p-3 space-y-2.5">
              <p className="font-semibold text-xs">Score Breakdown (0 – 100)</p>
              <div className="space-y-2">
                {[
                  { label: "Avg Views",    pts: "25 pts", desc: "Percentile rank of avg views across all analyzed videos" },
                  { label: "Engagement",   pts: "25 pts", desc: "Likes + comments per view vs. platform benchmarks" },
                  { label: "Trending",     pts: "25 pts", desc: "% of videos beating the channel's own Z-score baseline" },
                  { label: "Consistency",  pts: "25 pts", desc: "Stable view counts across videos (low variance = high score)" },
                ].map(({ label, pts, desc }) => (
                  <div key={label} className="space-y-0.5">
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-medium text-[11px]">{label}</span>
                      <span className="opacity-60 text-[10px]">{pts}</span>
                    </div>
                    <p className="opacity-60 text-[10px] leading-relaxed">{desc}</p>
                  </div>
                ))}
              </div>
              <p className="opacity-40 text-[10px] pt-1 border-t border-current/15">
                Final score = sum of the 4 components above
              </p>
            </div>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  );
}

function StatCard({
  icon,
  iconBg,
  label,
  value,
  sub,
  valueClass,
}: {
  icon: React.ReactNode;
  iconBg: string;
  label: string;
  value: string;
  sub: string;
  valueClass?: string;
}) {
  return (
    <div className="rounded-xl border border-border/60 bg-card p-4 sm:p-5 card-surface">
      <div className="flex items-start justify-between mb-3">
        <div className={`rounded-lg p-2 ${iconBg}`}>{icon}</div>
      </div>
      <p className={`text-2xl font-extrabold tracking-tight ${valueClass ?? "text-foreground"}`}>
        {value}
      </p>
      <p className="text-xs font-medium text-muted-foreground mt-0.5 leading-relaxed">
        {label}
      </p>
      <p className="text-[11px] text-muted-foreground/70 mt-0.5">{sub}</p>
    </div>
  );
}
