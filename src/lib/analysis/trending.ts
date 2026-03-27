/**
 * Trending Detection — Z-Score Algorithm
 *
 * Compares each video's daily view velocity against the channel's own baseline.
 * This makes the metric channel-relative: a small creator with 1K avg views
 * getting 5K on a video is "viral" for THAT channel.
 *
 * Recency boost: videos under 7 days old get a 1.5x multiplier since YouTube's
 * algorithm pushes fresh content harder and early velocity is a strong signal.
 */

import type { TrendingStatus, VideoItem } from "@/types/video";
import { differenceInDays } from "date-fns";

const RECENCY_THRESHOLD_DAYS = 7;
const RECENCY_MULTIPLIER = 1.5;

function stddev(values: number[], mean: number): number {
  if (values.length < 2) return 0;
  const variance =
    values.reduce((sum, v) => sum + Math.pow(v - mean, 2), 0) /
    (values.length - 1);
  return Math.sqrt(variance);
}

function zScoreToStatus(z: number): TrendingStatus {
  if (z > 2.0) return "viral";
  if (z > 1.0) return "hot";
  if (z > 0.25) return "above_average";
  if (z > -0.5) return "average";
  return "below_average";
}

export function computeTrending(
  videos: VideoItem[],
  now = new Date()
): Map<string, { status: TrendingStatus; viewsPerDay: number; daysOld: number }> {
  const enriched = videos.map((v) => {
    const daysOld = Math.max(differenceInDays(now, new Date(v.publishedAt)), 1);
    const rawVpd = v.viewCount / daysOld;
    const viewsPerDay =
      daysOld <= RECENCY_THRESHOLD_DAYS ? rawVpd * RECENCY_MULTIPLIER : rawVpd;
    return { id: v.id, viewsPerDay, daysOld };
  });

  const vpds = enriched.map((e) => e.viewsPerDay);
  const mean = vpds.reduce((s, v) => s + v, 0) / vpds.length;
  const sd = stddev(vpds, mean);

  const result = new Map<
    string,
    { status: TrendingStatus; viewsPerDay: number; daysOld: number }
  >();

  for (const e of enriched) {
    const z = sd > 0 ? (e.viewsPerDay - mean) / sd : 0;
    result.set(e.id, {
      status: zScoreToStatus(z),
      viewsPerDay: e.viewsPerDay,
      daysOld: e.daysOld,
    });
  }

  return result;
}
