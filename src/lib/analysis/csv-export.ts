/**
 * CSV Export Utility
 *
 * Converts the current filtered video list to a downloadable CSV file using
 * PapaParse. Handles special characters in titles (commas, quotes, unicode).
 */

import Papa from "papaparse";
import type { VideoWithScore } from "@/types/video";
import { formatDuration } from "@/lib/utils";
import { sanitizeCsvField } from "@/lib/security/sanitize";

export function exportVideosToCsv(
  videos: VideoWithScore[],
  channelHandle: string
): void {
  const rows = videos.map((v) => ({
    Title: sanitizeCsvField(v.title),
    URL: `https://www.youtube.com/watch?v=${v.id}`,
    "Published Date": new Date(v.publishedAt).toLocaleDateString("en-US"),
    Views: v.viewCount,
    Likes: v.likeCount,
    Comments: v.commentCount,
    "Engagement Rate (%)": v.engagementRate.toFixed(2),
    "Performance Score": v.performanceScore,
    "Trending Status": v.trendingStatus.replace("_", " "),
    Duration: formatDuration(v.duration),
    "Views / Day": Math.round(v.viewsPerDay),
    "Days Since Published": v.daysOld,
  }));

  const csv = Papa.unparse(rows);
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);

  const date = new Date().toISOString().split("T")[0];
  const handle = channelHandle.replace("@", "") || "channel";
  const filename = `vidmetrics-${handle}-${date}.csv`;

  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}
