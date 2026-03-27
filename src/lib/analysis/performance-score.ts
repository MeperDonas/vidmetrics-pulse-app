/**
 * Performance Score — Composite 0–100 Metric
 *
 * Combines four equally weighted dimensions (25 pts each):
 *
 *   viewsScore        — percentile rank within the channel's video set
 *   engagementScore   — engagement rate benchmarked against known thresholds
 *   consistencyScore  — ratio of this video's views to the channel average
 *   growthScore       — views-per-day velocity relative to channel average
 *
 * The result is always clamped to [0, 100].
 */

import type { VideoItem } from "@/types/video";

function clamp(v: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, v));
}

function viewsScore(video: VideoItem, allVideos: VideoItem[]): number {
  const rank = allVideos.filter((v) => v.viewCount <= video.viewCount).length;
  return clamp((rank / allVideos.length) * 25, 0, 25);
}

function engagementScore(engagementRate: number): number {
  // Benchmarks: <2% poor | 2–5% average | 5–10% good | >10% excellent
  if (engagementRate >= 10) return 25;
  if (engagementRate >= 5) return 15 + (engagementRate - 5) * 2;
  if (engagementRate >= 2) return 5 + (engagementRate - 2) * (10 / 3);
  return clamp(engagementRate * 2.5, 0, 5);
}

function consistencyScore(
  videoViews: number,
  channelAvgViews: number
): number {
  if (channelAvgViews === 0) return 0;
  const ratio = videoViews / channelAvgViews;
  return clamp(ratio * 12.5, 0, 25);
}

function growthScore(viewsPerDay: number, channelAvgVpd: number): number {
  if (channelAvgVpd === 0) return 0;
  const ratio = viewsPerDay / channelAvgVpd;
  return clamp(ratio * 12.5, 0, 25);
}

export function computePerformanceScores(
  videos: VideoItem[],
  viewsPerDayMap: Map<string, number>
): Map<string, number> {
  if (videos.length === 0) return new Map();

  const totalViews = videos.reduce((s, v) => s + v.viewCount, 0);
  const channelAvgViews = totalViews / videos.length;

  const vpds = videos.map((v) => viewsPerDayMap.get(v.id) ?? 0);
  const channelAvgVpd = vpds.reduce((s, v) => s + v, 0) / vpds.length;

  const result = new Map<string, number>();

  for (const video of videos) {
    const vpd = viewsPerDayMap.get(video.id) ?? 0;

    const score =
      viewsScore(video, videos) +
      engagementScore(video.engagementRate) +
      consistencyScore(video.viewCount, channelAvgViews) +
      growthScore(vpd, channelAvgVpd);

    result.set(video.id, clamp(Math.round(score), 0, 100));
  }

  return result;
}
