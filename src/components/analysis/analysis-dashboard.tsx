"use client";

/**
 * AnalysisDashboard
 *
 * Top-level client component that owns the analysis state and coordinates
 * all child components. Renders the channel input, progressive loading
 * states, and the full dashboard once data is available.
 */

import { useState, useMemo } from "react";
import { BarChart2, LayoutGrid, Layers, Play, Zap } from "lucide-react";
import { ChannelInput } from "@/components/channel/channel-input";
import { ChannelHeader } from "@/components/channel/channel-header";
import { ChannelStats } from "@/components/channel/channel-stats";
import { VideoList } from "@/components/videos/video-list";
import { ViewsOverTime } from "@/components/charts/views-over-time";
import { EngagementBreakdown } from "@/components/charts/engagement-breakdown";
import { PerformanceRadar } from "@/components/charts/performance-radar";
import { GrowthTrendChart } from "@/components/charts/growth-trend";
import { ContentBreakdown } from "@/components/charts/content-breakdown";
import { ExportButton } from "./export-button";
import { ShareButton } from "./share-button";
import { DashboardSkeleton } from "@/components/shared/loading-skeleton";
import { ErrorState } from "@/components/shared/error-state";
import { EmptyState } from "@/components/shared/empty-state";
import { useChannelAnalysis, computeContentBreakdown, computeGrowthTrend } from "@/hooks/use-channel-analysis";
import { type ContentType } from "@/hooks/use-video-filters";
import { parseDurationSeconds } from "@/lib/utils";

const PHASE_MESSAGES: Record<string, string> = {
  resolving: "Looking up channel...",
  fetching: "Fetching video analytics...",
  computing: "Crunching the numbers...",
};

type ActiveTab = "videos" | "charts";

export function AnalysisDashboard() {
  const { analysis, phase, error, analyze, reset } = useChannelAnalysis();
  const [activeTab, setActiveTab] = useState<ActiveTab>("videos");
  const [chartsContentType, setChartsContentType] = useState<ContentType>("all");

  const chartsVideos = useMemo(() => {
    if (!analysis) return [];
    if (chartsContentType === "shorts") return analysis.videos.filter((v) => parseDurationSeconds(v.duration) < 60);
    if (chartsContentType === "videos") return analysis.videos.filter((v) => parseDurationSeconds(v.duration) >= 60);
    return analysis.videos;
  }, [analysis, chartsContentType]);

  const chartsContentBreakdown = useMemo(() => computeContentBreakdown(chartsVideos), [chartsVideos]);
  const chartsGrowthTrend = useMemo(() => computeGrowthTrend(chartsVideos), [chartsVideos]);

  const isLoading =
    phase === "resolving" || phase === "fetching" || phase === "computing";
  const phaseMessage = PHASE_MESSAGES[phase] ?? "";

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* ── Hero section ──────────────────────────────────── */}
      <section className="hero-bg pt-12 pb-10 sm:pt-16 sm:pb-12">
        <div className="max-w-2xl mx-auto text-center space-y-5">
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-xs font-medium text-primary">
            <span className="h-1.5 w-1.5 rounded-full bg-primary" />
            Competitor Intelligence
          </div>

          <div className="space-y-3">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-foreground leading-tight">
              Analyze Any{" "}
              <span className="relative inline-block">
                <span className="relative z-10 text-primary">YouTube</span>
                <span
                  className="absolute inset-x-0 bottom-0.5 h-2 bg-primary/15 rounded-sm -z-0"
                  aria-hidden
                />
              </span>{" "}
              Channel
            </h1>
            <p className="text-base text-muted-foreground max-w-lg mx-auto leading-relaxed">
              Paste a competitor&apos;s URL and instantly see which videos are
              crushing it — views, engagement, trending signals, and more.
            </p>
          </div>

          <div className="pt-1">
            <ChannelInput
              onAnalyze={analyze}
              isLoading={isLoading}
              defaultValue=""
            />
          </div>

          {isLoading && (
            <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
              <span className="h-1.5 w-1.5 rounded-full bg-primary animate-bounce [animation-delay:0ms]" />
              <span className="h-1.5 w-1.5 rounded-full bg-primary animate-bounce [animation-delay:150ms]" />
              <span className="h-1.5 w-1.5 rounded-full bg-primary animate-bounce [animation-delay:300ms]" />
              <span className="ml-1">{phaseMessage}</span>
            </div>
          )}
        </div>
      </section>

      {/* ── Content area ──────────────────────────────────── */}
      <div className="pb-16">
        {isLoading && <DashboardSkeleton />}

        {error && !isLoading && (
          <ErrorState message={error} onRetry={reset} />
        )}

        {phase === "idle" && !error && (
          <EmptyState />
        )}

        {analysis && phase === "done" && (
          <div className="space-y-4">
            {/* Channel header */}
            <ChannelHeader channel={analysis.channel} />

            {/* Summary stat cards */}
            <ChannelStats summary={analysis.summary} />

            {/* ── Segmented tab bar + action buttons ─────── */}
            <div className="flex items-center justify-between gap-3 pt-2">
              <div className="inline-flex items-center gap-1 rounded-xl border border-border/60 bg-muted/40 p-1">
                <TabPill
                  active={activeTab === "videos"}
                  onClick={() => setActiveTab("videos")}
                  icon={<LayoutGrid className="h-3.5 w-3.5" />}
                  label={`Videos (${analysis.videos.length})`}
                />
                <TabPill
                  active={activeTab === "charts"}
                  onClick={() => setActiveTab("charts")}
                  icon={<BarChart2 className="h-3.5 w-3.5" />}
                  label="Charts"
                />
              </div>

              <div className="flex items-center gap-2">
                <ExportButton
                  videos={analysis.videos}
                  channel={analysis.channel}
                  summary={analysis.summary}
                />
                <ShareButton channelId={analysis.channel.id} />
              </div>
            </div>

            {/* ── Tab content ───────────────────────────────── */}
            {activeTab === "videos" && (
              <div className="mt-1">
                <VideoList videos={analysis.videos} />
              </div>
            )}

            {activeTab === "charts" && (
              <div className="mt-1 space-y-4">
                {/* Segment control */}
                <div className="inline-flex items-center gap-1 rounded-xl border border-border/60 bg-muted/40 p-1">
                  <ContentPill
                    active={chartsContentType === "all"}
                    onClick={() => setChartsContentType("all")}
                    icon={<Layers className="h-3 w-3" />}
                    label={`All (${analysis.videos.length})`}
                  />
                  <ContentPill
                    active={chartsContentType === "videos"}
                    onClick={() => setChartsContentType("videos")}
                    icon={<Play className="h-3 w-3" />}
                    label={`Videos (${analysis.videos.filter((v) => parseDurationSeconds(v.duration) >= 60).length})`}
                  />
                  {analysis.summary.shortsCount > 0 && (
                    <ContentPill
                      active={chartsContentType === "shorts"}
                      onClick={() => setChartsContentType("shorts")}
                      icon={<Zap className="h-3 w-3" />}
                      label={`Shorts (${analysis.summary.shortsCount})`}
                      accent
                    />
                  )}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  {/* Row 1: time-series + engagement */}
                  <div className="rounded-xl border border-border/60 bg-card p-5 card-surface">
                    <ViewsOverTime
                      videos={chartsVideos}
                      averageViews={chartsVideos.reduce((s, v) => s + v.viewCount, 0) / (chartsVideos.length || 1)}
                    />
                  </div>
                  <div className="rounded-xl border border-border/60 bg-card p-5 card-surface">
                    <EngagementBreakdown videos={chartsVideos} />
                  </div>

                  {/* Row 2: growth trend + content format */}
                  <div className="rounded-xl border border-border/60 bg-card p-5 card-surface">
                    <GrowthTrendChart
                      videos={chartsVideos}
                      growthTrend={chartsGrowthTrend}
                    />
                  </div>
                  {chartsContentBreakdown.length > 0 && (
                    <div className="rounded-xl border border-border/60 bg-card p-5 card-surface">
                      <ContentBreakdown contentBreakdown={chartsContentBreakdown} />
                    </div>
                  )}

                  {/* Row 3: performance profile — full width */}
                  <div className={`rounded-xl border border-border/60 bg-card p-5 card-surface ${chartsContentBreakdown.length > 0 ? "lg:col-span-2" : "lg:col-span-2"}`}>
                    <PerformanceRadar
                      summary={analysis.summary}
                      videos={chartsVideos}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Reset */}
            <div className="text-center pt-2 pb-4">
              <button
                onClick={reset}
                className="text-sm text-muted-foreground hover:text-foreground underline-offset-4 hover:underline transition-colors"
              >
                ← Analyze a different channel
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function TabPill({
  active,
  onClick,
  icon,
  label,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <button
      onClick={onClick}
      className={`inline-flex items-center gap-1.5 rounded-lg px-3.5 py-1.5 text-sm font-medium transition-all duration-150 ${
        active
          ? "bg-background text-foreground shadow-sm border border-border/60"
          : "text-muted-foreground hover:text-foreground hover:bg-background/50"
      }`}
    >
      {icon}
      {label}
    </button>
  );
}

function ContentPill({
  active,
  onClick,
  icon,
  label,
  accent = false,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
  accent?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-all duration-150 ${
        active
          ? accent
            ? "bg-background text-amber-500 shadow-sm border border-amber-500/30"
            : "bg-background text-foreground shadow-sm border border-border/60"
          : "text-muted-foreground hover:text-foreground hover:bg-background/50"
      }`}
    >
      {icon}
      {label}
    </button>
  );
}
