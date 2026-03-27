"use client";

import { LayoutGrid, List, Zap, Play, Layers } from "lucide-react";
import { useState } from "react";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import type { VideoWithScore } from "@/types/video";
import { formatNumber, formatDuration, scoreColor, parseDurationSeconds } from "@/lib/utils";
import { VideoCard } from "./video-card";
import { VideoFilters } from "./video-filters";
import { TrendingIndicator } from "./trending-indicator";
import { useVideoFilters, type ContentType } from "@/hooks/use-video-filters";

interface VideoListProps {
  videos: VideoWithScore[];
}

export function VideoList({ videos }: VideoListProps) {
  const [view, setView] = useState<"grid" | "list">("grid");

  const {
    filteredVideos,
    sortField,
    sortDirection,
    dateRange,
    searchQuery,
    contentType,
    videosCount,
    shortsCount,
    setSortField,
    setSortDirection,
    setDateRange,
    setSearchQuery,
    setContentType,
    resetFilters,
  } = useVideoFilters(videos);

  const isShortFn = (v: VideoWithScore) => parseDurationSeconds(v.duration) < 60;

  return (
    <div className="space-y-4">
      {/* Content-type tabs + view toggle */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        {/* Segment: All / Videos / Shorts */}
        <div className="inline-flex items-center gap-1 rounded-xl border border-border/60 bg-muted/40 p-1">
          <ContentPill
            active={contentType === "all"}
            onClick={() => setContentType("all")}
            icon={<Layers className="h-3 w-3" />}
            label={`All (${videos.length})`}
          />
          <ContentPill
            active={contentType === "videos"}
            onClick={() => setContentType("videos")}
            icon={<Play className="h-3 w-3" />}
            label={`Videos (${videosCount})`}
          />
          {shortsCount > 0 && (
            <ContentPill
              active={contentType === "shorts"}
              onClick={() => setContentType("shorts")}
              icon={<Zap className="h-3 w-3" />}
              label={`Shorts (${shortsCount})`}
              accent
            />
          )}
        </div>

        {/* Grid / List view toggle */}
        <div className="flex items-center gap-1 rounded-md border p-0.5 bg-muted/50">
          <Button
            variant={view === "grid" ? "secondary" : "ghost"}
            size="icon"
            className="h-7 w-7"
            onClick={() => setView("grid")}
            aria-label="Grid view"
          >
            <LayoutGrid className="h-3.5 w-3.5" />
          </Button>
          <Button
            variant={view === "list" ? "secondary" : "ghost"}
            size="icon"
            className="h-7 w-7"
            onClick={() => setView("list")}
            aria-label="List view"
          >
            <List className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>

      <VideoFilters
        sortField={sortField}
        sortDirection={sortDirection}
        dateRange={dateRange}
        searchQuery={searchQuery}
        onSortFieldChange={setSortField}
        onSortDirectionChange={setSortDirection}
        onDateRangeChange={setDateRange}
        onSearchChange={setSearchQuery}
        onReset={resetFilters}
        resultCount={filteredVideos.length}
        totalCount={contentType === "all" ? videos.length : contentType === "shorts" ? shortsCount : videosCount}
        contentType={contentType}
      />

      {filteredVideos.length === 0 ? (
        <div className="py-12 text-center text-muted-foreground text-sm">
          No {contentType === "shorts" ? "Shorts" : "videos"} match your current filters.
        </div>
      ) : view === "grid" ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredVideos.map((video) => (
            <VideoCard key={video.id} video={video} isShort={isShortFn(video)} />
          ))}
        </div>
      ) : (
        <div className="space-y-2">
          {filteredVideos.map((video) => (
            <VideoListRow key={video.id} video={video} isShort={isShortFn(video)} />
          ))}
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Content type pill button
// ---------------------------------------------------------------------------

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
            ? "bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/30 shadow-sm"
            : "bg-background text-foreground border border-border/60 shadow-sm"
          : accent
          ? "text-amber-500/70 hover:text-amber-500 hover:bg-amber-500/5"
          : "text-muted-foreground hover:text-foreground hover:bg-background/50"
      }`}
    >
      {icon}
      {label}
    </button>
  );
}

// ---------------------------------------------------------------------------
// List row
// ---------------------------------------------------------------------------

const ACCENT_COLOR: Record<string, string> = {
  viral:         "bg-red-500",
  hot:           "bg-orange-500",
  above_average: "bg-emerald-500",
  average:       "bg-border",
  below_average: "bg-border",
};

function VideoListRow({ video, isShort }: { video: VideoWithScore; isShort: boolean }) {
  const href = isShort
    ? `https://www.youtube.com/shorts/${video.id}`
    : `https://www.youtube.com/watch?v=${video.id}`;

  const accentBar = ACCENT_COLOR[video.trendingStatus] ?? "bg-border";

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="group relative flex items-center gap-4 pl-4 pr-4 py-3 rounded-xl border border-border/60 bg-card card-surface overflow-hidden transition-all duration-150 hover:border-primary/30 hover:shadow-md hover:shadow-primary/5"
    >
      {/* Left accent bar — absolute positioned, no border conflict */}
      <span className={`absolute left-0 top-0 h-full w-[3px] ${accentBar} rounded-l-xl`} />

      {/* Thumbnail */}
      <div className="relative h-[68px] w-[120px] shrink-0 rounded-lg overflow-hidden bg-muted">
        {video.thumbnailUrl && (
          <img
            src={video.thumbnailUrl}
            alt=""
            className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        )}
        {isShort ? (
          <span className="absolute bottom-1 right-1 inline-flex items-center gap-0.5 bg-amber-500 text-white text-[9px] px-1.5 py-0.5 rounded font-bold uppercase tracking-wide">
            <Zap className="h-2.5 w-2.5" /> Short
          </span>
        ) : (
          <span className="absolute bottom-1 right-1 bg-black/75 text-white text-[10px] px-1.5 py-0.5 rounded font-mono">
            {formatDuration(video.duration)}
          </span>
        )}
        {(video.trendingStatus === "viral" || video.trendingStatus === "hot") && (
          <span className="absolute top-1 left-1">
            <TrendingIndicator status={video.trendingStatus} compact />
          </span>
        )}
      </div>

      {/* Title + date */}
      <div className="flex-1 min-w-0 space-y-1">
        <p className="text-sm font-semibold leading-snug line-clamp-2 text-foreground group-hover:text-primary transition-colors duration-150">
          {video.title}
        </p>
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs text-muted-foreground">
            {format(new Date(video.publishedAt), "MMM d, yyyy")}
          </span>
          {video.daysOld <= 7 && (
            <span className="inline-flex items-center rounded-full bg-emerald-500/10 px-1.5 py-0.5 text-[10px] font-medium text-emerald-600 dark:text-emerald-400">
              New
            </span>
          )}
          {isShort && (
            <span className="inline-flex items-center gap-0.5 rounded-full bg-amber-500/10 px-1.5 py-0.5 text-[10px] font-medium text-amber-600 dark:text-amber-400">
              <Zap className="h-2.5 w-2.5" /> Short
            </span>
          )}
        </div>
      </div>

      {/* Metric columns — hidden on mobile */}
      <div className="hidden md:flex items-center gap-5 shrink-0">
        <MetricCol label="Views"      value={formatNumber(video.viewCount)} />
        <MetricCol label="Likes"      value={formatNumber(video.likeCount)} />
        <MetricCol label="Engagement" value={`${video.engagementRate.toFixed(1)}%`} />
        <MetricCol label="Views/Day"  value={formatNumber(Math.round(video.viewsPerDay))} />
      </div>

      {/* Divider */}
      <div className="hidden sm:block w-px h-8 bg-border/50 shrink-0" />

      {/* Score badge */}
      <div className="shrink-0 flex flex-col items-center gap-0.5 min-w-[36px]">
        <span className={`text-xl font-extrabold tabular-nums leading-none ${scoreColor(video.performanceScore)}`}>
          {video.performanceScore}
        </span>
        <span className="text-[9px] text-muted-foreground uppercase tracking-wider font-medium">
          Score
        </span>
      </div>
    </a>
  );
}

function MetricCol({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col items-end gap-0.5 min-w-[52px]">
      <span className="text-sm font-semibold tabular-nums text-foreground leading-none">
        {value}
      </span>
      <span className="text-[10px] text-muted-foreground/70 uppercase tracking-wider">
        {label}
      </span>
    </div>
  );
}
