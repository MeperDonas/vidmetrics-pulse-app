import type { ChannelInfo } from "./channel";
import type { VideoItem } from "./video";

export interface ChannelRequest {
  url: string;
}

export interface ChannelResponse {
  success: boolean;
  data?: ChannelInfo;
  error?: string;
}

export interface VideosRequest {
  channelId: string;
  uploadsPlaylistId: string;
  maxResults?: number;
}

export interface VideosResponse {
  success: boolean;
  data?: {
    videos: VideoItem[];
    totalResults: number;
  };
  error?: string;
}
