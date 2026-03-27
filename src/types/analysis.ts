import type { ChannelInfo } from "./channel";
import type { VideoWithScore } from "./video";

export type SortField =
  | "publishedAt"
  | "viewCount"
  | "likeCount"
  | "commentCount"
  | "engagementRate"
  | "performanceScore";

export type SortDirection = "asc" | "desc";

export type DateRange = "7d" | "30d" | "90d" | "all";

/**
 * Comparison of the channel's most recent videos vs. the previous cohort.
 * Used to answer: "Is this channel growing or declining?"
 */
export interface GrowthTrend {
  direction: "up" | "down" | "flat";
  /** Avg views of the N most recent videos (chronological order) */
  recentAvgViews: number;
  /** Avg views of the N videos before those */
  olderAvgViews: number;
  /** Percentage change: positive = growth, negative = decline */
  changePercent: number;
  /** Number of videos in each cohort */
  cohortSize: number;
}

/**
 * Performance metrics for a group of videos sharing the same duration bucket.
 */
export interface ContentBucket {
  label: string;
  durationRange: string;
  count: number;
  avgViews: number;
  avgEngagement: number;
  avgScore: number;
}

export interface AnalysisSummary {
  totalVideosAnalyzed: number;
  averageViews: number;
  averageLikes: number;
  averageComments: number;
  averageEngagementRate: number;
  topPerformer: VideoWithScore;
  overallScore: number;
  trendingCount: number;
  /** Recent vs. older cohort comparison */
  growthTrend: GrowthTrend;
  /** Performance broken down by content format (Shorts, Short-form, Medium, Long-form) */
  contentBreakdown: ContentBucket[];
  /** Number of Shorts (< 60s) in the analyzed set */
  shortsCount: number;
}

export interface AnalysisResult {
  channel: ChannelInfo;
  videos: VideoWithScore[];
  summary: AnalysisSummary;
  fetchedAt: string;
}
