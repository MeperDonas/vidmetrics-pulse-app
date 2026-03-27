export type TrendingStatus =
  | "viral"
  | "hot"
  | "above_average"
  | "average"
  | "below_average";

export interface VideoItem {
  id: string;
  title: string;
  thumbnailUrl: string;
  publishedAt: string;
  duration: string;
  viewCount: number;
  likeCount: number;
  commentCount: number;
  engagementRate: number;
}

export interface VideoWithScore extends VideoItem {
  performanceScore: number;
  trendingStatus: TrendingStatus;
  viewsPerDay: number;
  daysOld: number;
}
