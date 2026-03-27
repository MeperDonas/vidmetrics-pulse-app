/**
 * YouTube Data API v3 Client
 *
 * All calls are server-side only. The API key is never exposed to the browser.
 *
 * Quota-efficient strategy (~8 units per full analysis):
 *   1. channels.list   → 1-3 units  — channel info + uploads playlist ID
 *   2. playlistItems.list → 3 units/page — recent video IDs
 *   3. videos.list     → 1 unit/page — detailed stats per video
 *
 * This avoids the search.list endpoint which costs 100 units per call.
 */

import type { ChannelInfo } from "@/types/channel";
import type { VideoItem } from "@/types/video";
import type { ParsedChannelUrl } from "./url-parser";

const BASE_URL = "https://www.googleapis.com/youtube/v3";

function getApiKey(): string {
  const key = process.env.YOUTUBE_API_KEY;
  if (!key) throw new Error("YOUTUBE_API_KEY environment variable is not set");
  return key;
}

export class YouTubeApiError extends Error {
  constructor(
    public readonly statusCode: number,
    internalMessage: string
  ) {
    super(internalMessage);
    this.name = "YouTubeApiError";
  }
}

async function ytFetch<T>(
  endpoint: string,
  params: Record<string, string>
): Promise<T> {
  const url = new URL(`${BASE_URL}/${endpoint}`);
  url.searchParams.set("key", getApiKey());

  for (const [k, v] of Object.entries(params)) {
    url.searchParams.set(k, v);
  }

  const res = await fetch(url.toString(), { cache: "no-store" });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    const message = body?.error?.message ?? `HTTP ${res.status}`;
    throw new YouTubeApiError(res.status, `YouTube API error: ${message}`);
  }

  return res.json() as Promise<T>;
}

// ---------------------------------------------------------------------------
// Resolve a parsed URL to a channel ID
// ---------------------------------------------------------------------------

export async function resolveChannelId(
  parsed: ParsedChannelUrl
): Promise<string> {
  if (parsed.type === "channel_id") return parsed.value;

  type ChannelListResponse = {
    items?: Array<{ id: string }>;
  };

  if (parsed.type === "handle") {
    const data = await ytFetch<ChannelListResponse>("channels", {
      part: "id",
      forHandle: parsed.value,
    });
    const id = data.items?.[0]?.id;
    if (!id) throw new Error("Channel not found");
    return id;
  }

  if (parsed.type === "username") {
    const data = await ytFetch<ChannelListResponse>("channels", {
      part: "id",
      forUsername: parsed.value,
    });
    const id = data.items?.[0]?.id;
    if (!id) throw new Error("Channel not found");
    return id;
  }

  // custom_url — fall back to a search (100 units, used only as last resort)
  type SearchResponse = {
    items?: Array<{ id: { channelId?: string } }>;
  };

  const data = await ytFetch<SearchResponse>("search", {
    part: "id",
    type: "channel",
    q: parsed.value,
    maxResults: "1",
  });

  const id = data.items?.[0]?.id?.channelId;
  if (!id) throw new Error("Channel not found");
  return id;
}

// ---------------------------------------------------------------------------
// Fetch full channel info
// ---------------------------------------------------------------------------

export async function fetchChannelInfo(channelId: string): Promise<ChannelInfo> {
  type ChannelListResponse = {
    items?: Array<{
      id: string;
      snippet: {
        title: string;
        description: string;
        customUrl: string;
        publishedAt: string;
        thumbnails: { high?: { url: string }; default?: { url: string } };
      };
      statistics: {
        subscriberCount: string;
        videoCount: string;
        viewCount: string;
      };
      contentDetails: {
        relatedPlaylists: { uploads: string };
      };
    }>;
  };

  const data = await ytFetch<ChannelListResponse>("channels", {
    part: "snippet,statistics,contentDetails",
    id: channelId,
  });

  const item = data.items?.[0];
  if (!item) throw new Error("Channel not found");

  return {
    id: item.id,
    title: item.snippet.title,
    description: item.snippet.description,
    customUrl: item.snippet.customUrl ?? "",
    thumbnailUrl:
      item.snippet.thumbnails.high?.url ??
      item.snippet.thumbnails.default?.url ??
      "",
    subscriberCount: parseInt(item.statistics.subscriberCount ?? "0", 10),
    videoCount: parseInt(item.statistics.videoCount ?? "0", 10),
    viewCount: parseInt(item.statistics.viewCount ?? "0", 10),
    publishedAt: item.snippet.publishedAt,
    uploadsPlaylistId: item.contentDetails.relatedPlaylists.uploads,
  };
}

// ---------------------------------------------------------------------------
// Fetch recent videos from the uploads playlist
// ---------------------------------------------------------------------------

export async function fetchRecentVideos(
  uploadsPlaylistId: string,
  maxResults = 50
): Promise<VideoItem[]> {
  // Step 1: Get video IDs from the uploads playlist (3 units per page)
  type PlaylistItemsResponse = {
    items?: Array<{
      snippet: {
        resourceId: { videoId: string };
        title: string;
        publishedAt: string;
        thumbnails: {
          medium?: { url: string };
          default?: { url: string };
        };
      };
    }>;
    nextPageToken?: string;
  };

  const videoIds: string[] = [];
  let pageToken: string | undefined;

  do {
    const params: Record<string, string> = {
      part: "snippet",
      playlistId: uploadsPlaylistId,
      maxResults: String(Math.min(50, maxResults - videoIds.length)),
    };

    if (pageToken) params.pageToken = pageToken;

    const page = await ytFetch<PlaylistItemsResponse>(
      "playlistItems",
      params
    );

    for (const item of page.items ?? []) {
      videoIds.push(item.snippet.resourceId.videoId);
    }

    pageToken = page.nextPageToken;
  } while (pageToken && videoIds.length < maxResults);

  if (videoIds.length === 0) return [];

  // Step 2: Batch-fetch full statistics for collected IDs (1 unit per 50 videos)
  type VideoListResponse = {
    items?: Array<{
      id: string;
      snippet: {
        title: string;
        publishedAt: string;
        thumbnails: {
          medium?: { url: string };
          default?: { url: string };
        };
      };
      statistics: {
        viewCount?: string;
        likeCount?: string;
        commentCount?: string;
      };
      contentDetails: {
        duration: string;
      };
    }>;
  };

  const videos: VideoItem[] = [];

  // Process in batches of 50 (API limit per request)
  for (let i = 0; i < videoIds.length; i += 50) {
    const batch = videoIds.slice(i, i + 50);
    const data = await ytFetch<VideoListResponse>("videos", {
      part: "snippet,statistics,contentDetails",
      id: batch.join(","),
    });

    for (const item of data.items ?? []) {
      const views = parseInt(item.statistics.viewCount ?? "0", 10);
      const likes = parseInt(item.statistics.likeCount ?? "0", 10);
      const comments = parseInt(item.statistics.commentCount ?? "0", 10);

      videos.push({
        id: item.id,
        title: item.snippet.title,
        thumbnailUrl:
          item.snippet.thumbnails.medium?.url ??
          item.snippet.thumbnails.default?.url ??
          "",
        publishedAt: item.snippet.publishedAt,
        duration: item.contentDetails.duration,
        viewCount: views,
        likeCount: likes,
        commentCount: comments,
        engagementRate: views > 0 ? ((likes + comments) / views) * 100 : 0,
      });
    }
  }

  return videos;
}
