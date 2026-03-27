import Image from "next/image";
import { Eye, Heart, MessageCircle, Clock, Zap } from "lucide-react";
import type { VideoWithScore } from "@/types/video";
import { formatNumber, formatDuration, scoreColor } from "@/lib/utils";
import { TrendingIndicator } from "./trending-indicator";
import { format } from "date-fns";

interface VideoCardProps {
  video: VideoWithScore;
  isShort?: boolean;
}

export function VideoCard({ video, isShort = false }: VideoCardProps) {
  const publishDate = format(new Date(video.publishedAt), "MMM d, yyyy");
  const href = isShort
    ? `https://www.youtube.com/shorts/${video.id}`
    : `https://www.youtube.com/watch?v=${video.id}`;

  return (
    <div className="group rounded-xl border border-border/60 bg-card overflow-hidden card-surface transition-all duration-200 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5">
      {/* Thumbnail — 9:16 for Shorts, 16:9 for regular videos */}
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="block relative aspect-video bg-muted overflow-hidden"
        aria-label={`Watch ${video.title}`}
      >
        {video.thumbnailUrl ? (
          <Image
            src={video.thumbnailUrl}
            alt={video.title}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-500"
            unoptimized
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-muted-foreground text-xs">
            No thumbnail
          </div>
        )}

        {/* Shorts badge — replaces duration */}
        {isShort ? (
          <span className="absolute bottom-2 right-2 inline-flex items-center gap-1 bg-amber-500 text-white text-[9px] px-1.5 py-0.5 rounded-md font-bold tracking-wide uppercase">
            <Zap className="h-2.5 w-2.5" />
            Short
          </span>
        ) : (
          <span className="absolute bottom-2 right-2 bg-black/75 backdrop-blur-sm text-white text-[10px] px-1.5 py-0.5 rounded-md font-mono font-medium tracking-tight">
            {formatDuration(video.duration)}
          </span>
        )}

        {/* Trending badge */}
        <span className="absolute top-2 left-2">
          <TrendingIndicator status={video.trendingStatus} />
        </span>

        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-200" />
      </a>

      {/* Content */}
      <div className="p-3.5 space-y-2.5">
        <p className="text-sm font-semibold leading-snug line-clamp-2 text-foreground group-hover:text-primary transition-colors duration-200">
          {video.title}
        </p>

        {/* Date + Score */}
        <div className="flex items-center justify-between">
          <span className="text-xs text-muted-foreground">{publishDate}</span>
          <span
            className={`text-sm font-extrabold tabular-nums ${scoreColor(video.performanceScore)}`}
            title="Performance Score"
          >
            {video.performanceScore}
            <span className="text-[10px] font-normal text-muted-foreground">/100</span>
          </span>
        </div>

        {/* Metrics */}
        <div className="flex items-center gap-0 pt-0.5">
          <Metric icon={<Eye className="h-3 w-3" />} value={formatNumber(video.viewCount)} className="flex-1" />
          <Metric icon={<Heart className="h-3 w-3" />} value={formatNumber(video.likeCount)} className="flex-1" />
          <Metric icon={<MessageCircle className="h-3 w-3" />} value={formatNumber(video.commentCount)} className="flex-1" />
          <Metric icon={<Clock className="h-3 w-3" />} value={`${video.engagementRate.toFixed(1)}%`} title="Engagement rate" className="flex-1" />
        </div>
      </div>
    </div>
  );
}

function Metric({
  icon,
  value,
  title,
  className,
}: {
  icon: React.ReactNode;
  value: string;
  title?: string;
  className?: string;
}) {
  return (
    <span
      className={`flex items-center gap-1 text-[11px] text-muted-foreground ${className ?? ""}`}
      title={title}
    >
      {icon}
      <span className="tabular-nums">{value}</span>
    </span>
  );
}
