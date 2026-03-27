"use client";

/**
 * useChannelAnalysis
 *
 * Primary data-fetching orchestrator. Manages the two-phase fetch
 * (channel info → video statistics), computes derived metrics client-side,
 * and exposes granular loading states for a progressive UI.
 */

import { useState, useCallback } from "react";
import type { AnalysisResult, ContentBucket, GrowthTrend } from "@/types/analysis";
import type { VideoWithScore } from "@/types/video";
import type { ChannelResponse, VideosResponse } from "@/types/api";
import { computeTrending } from "@/lib/analysis/trending";
import { computePerformanceScores } from "@/lib/analysis/performance-score";
import { parseDurationSeconds } from "@/lib/utils";

type Phase = "idle" | "resolving" | "fetching" | "computing" | "done";

interface UseChannelAnalysisReturn {
  analysis: AnalysisResult | null;
  phase: Phase;
  error: string | null;
  analyze: (url: string) => Promise<void>;
  reset: () => void;
}

// ---------------------------------------------------------------------------
// Content-format bucket definitions
// ---------------------------------------------------------------------------

const CONTENT_BUCKET_DEFS: Array<{
  label: string;
  durationRange: string;
  test: (secs: number) => boolean;
}> = [
  { label: "Shorts",      durationRange: "< 1 min",   test: (s) => s < 60 },
  { label: "Short-form",  durationRange: "1 – 5 min",  test: (s) => s >= 60 && s < 300 },
  { label: "Medium",      durationRange: "5 – 15 min", test: (s) => s >= 300 && s < 900 },
  { label: "Long-form",   durationRange: "> 15 min",   test: (s) => s >= 900 },
];

export function computeContentBreakdown(videos: VideoWithScore[]): ContentBucket[] {
  return CONTENT_BUCKET_DEFS.map((def) => {
    const group = videos.filter((v) => def.test(parseDurationSeconds(v.duration)));
    if (group.length === 0) return null;
    return {
      label: def.label,
      durationRange: def.durationRange,
      count: group.length,
      avgViews: Math.round(group.reduce((s, v) => s + v.viewCount, 0) / group.length),
      avgEngagement: group.reduce((s, v) => s + v.engagementRate, 0) / group.length,
      avgScore: Math.round(group.reduce((s, v) => s + v.performanceScore, 0) / group.length),
    };
  }).filter((b): b is ContentBucket => b !== null);
}

// ---------------------------------------------------------------------------
// Growth trend: compare the most recent N videos vs. the previous N
// ---------------------------------------------------------------------------

export function computeGrowthTrend(videos: VideoWithScore[]): GrowthTrend {
  // Sort oldest → newest
  const sorted = [...videos].sort(
    (a, b) => new Date(a.publishedAt).getTime() - new Date(b.publishedAt).getTime()
  );

  const N = Math.min(10, Math.floor(sorted.length / 2));
  if (N === 0) {
    return { direction: "flat", recentAvgViews: 0, olderAvgViews: 0, changePercent: 0, cohortSize: 0 };
  }

  const recent = sorted.slice(-N);
  const older  = sorted.slice(-N * 2, -N);

  const recentAvg = recent.reduce((s, v) => s + v.viewCount, 0) / recent.length;
  const olderAvg  = older.length > 0
    ? older.reduce((s, v) => s + v.viewCount, 0) / older.length
    : recentAvg;

  const changePercent = olderAvg > 0
    ? Math.round(((recentAvg - olderAvg) / olderAvg) * 100)
    : 0;

  const direction =
    changePercent > 5  ? "up"   :
    changePercent < -5 ? "down" : "flat";

  return {
    direction,
    recentAvgViews: Math.round(recentAvg),
    olderAvgViews:  Math.round(olderAvg),
    changePercent,
    cohortSize: N,
  };
}

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

export function useChannelAnalysis(): UseChannelAnalysisReturn {
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [phase, setPhase] = useState<Phase>("idle");
  const [error, setError] = useState<string | null>(null);

  const reset = useCallback(() => {
    setAnalysis(null);
    setPhase("idle");
    setError(null);
  }, []);

  const analyze = useCallback(async (url: string) => {
    setError(null);
    setAnalysis(null);

    // Phase 1: Resolve channel URL → channel info
    setPhase("resolving");
    const channelRes = await fetch("/api/youtube/channel", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url }),
    });

    const channelData = (await channelRes.json()) as ChannelResponse;
    if (!channelData.success || !channelData.data) {
      setError(channelData.error ?? "Failed to find channel.");
      setPhase("idle");
      return;
    }

    const channel = channelData.data;

    // Phase 2: Fetch recent videos
    setPhase("fetching");
    const videosRes = await fetch("/api/youtube/videos", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        channelId: channel.id,
        uploadsPlaylistId: channel.uploadsPlaylistId,
        maxResults: 50,
      }),
    });

    const videosData = (await videosRes.json()) as VideosResponse;
    if (!videosData.success || !videosData.data) {
      setError(videosData.error ?? "Failed to fetch videos.");
      setPhase("idle");
      return;
    }

    const rawVideos = videosData.data.videos;

    // Phase 3: Compute trending + performance scores client-side
    setPhase("computing");
    const trendingMap = computeTrending(rawVideos);
    const vpds = new Map(
      rawVideos.map((v) => [v.id, trendingMap.get(v.id)?.viewsPerDay ?? 0])
    );
    const scoresMap = computePerformanceScores(rawVideos, vpds);

    const videos: VideoWithScore[] = rawVideos.map((v) => {
      const trending = trendingMap.get(v.id)!;
      return {
        ...v,
        performanceScore: scoresMap.get(v.id) ?? 0,
        trendingStatus:   trending.status,
        viewsPerDay:      trending.viewsPerDay,
        daysOld:          trending.daysOld,
      };
    });

    // Default sort: performance score descending
    videos.sort((a, b) => b.performanceScore - a.performanceScore);

    // Aggregate summary
    const totalViews    = videos.reduce((s, v) => s + v.viewCount, 0);
    const totalLikes    = videos.reduce((s, v) => s + v.likeCount, 0);
    const totalComments = videos.reduce((s, v) => s + v.commentCount, 0);
    const topPerformer  = [...videos].sort((a, b) => b.viewCount - a.viewCount)[0];
    const overallScore  = videos.length
      ? Math.round(videos.reduce((s, v) => s + v.performanceScore, 0) / videos.length)
      : 0;
    const trendingCount = videos.filter(
      (v) => v.trendingStatus === "viral" || v.trendingStatus === "hot" || v.trendingStatus === "above_average"
    ).length;

    // New: growth trend + content breakdown
    const growthTrend      = computeGrowthTrend(videos);
    const contentBreakdown = computeContentBreakdown(videos);
    const shortsCount      = contentBreakdown.find((b) => b.label === "Shorts")?.count ?? 0;

    setAnalysis({
      channel,
      videos,
      summary: {
        totalVideosAnalyzed: videos.length,
        averageViews:    videos.length ? Math.round(totalViews    / videos.length) : 0,
        averageLikes:    videos.length ? Math.round(totalLikes    / videos.length) : 0,
        averageComments: videos.length ? Math.round(totalComments / videos.length) : 0,
        averageEngagementRate: videos.length
          ? videos.reduce((s, v) => s + v.engagementRate, 0) / videos.length
          : 0,
        topPerformer,
        overallScore,
        trendingCount,
        growthTrend,
        contentBreakdown,
        shortsCount,
      },
      fetchedAt: new Date().toISOString(),
    });

    setPhase("done");
  }, []);

  return { analysis, phase, error, analyze, reset };
}
