/**
 * POST /api/youtube/videos
 *
 * Fetches the most recent videos from a YouTube channel along with their
 * full statistics. Uses the uploads playlist strategy (3 units/page) instead
 * of the search endpoint (100 units) for maximum quota efficiency.
 *
 * Body:   { channelId: string, uploadsPlaylistId: string, maxResults?: number }
 * Returns: VideosResponse
 *
 * Security: rate limited (5 req/min/IP), Zod-validated input, maxResults clamped to 1-50.
 */

import { NextResponse } from "next/server";
import type { VideosResponse } from "@/types/api";
import { fetchRecentVideos } from "@/lib/youtube/client";
import { createRateLimiter } from "@/lib/security/rate-limit";
import { videosRequestSchema } from "@/lib/security/schemas";

const limiter = createRateLimiter({ windowMs: 60_000, maxRequests: 5 });

export async function POST(request: Request): Promise<NextResponse<VideosResponse>> {
  // Payload size guard
  const contentLength = parseInt(request.headers.get("content-length") ?? "0", 10);
  if (contentLength > 512) {
    return NextResponse.json(
      { success: false, error: "Request too large." },
      { status: 413 }
    );
  }

  // Rate limiting
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "anonymous";
  const { allowed, resetMs } = limiter.check(ip);
  if (!allowed) {
    return NextResponse.json(
      { success: false, error: "Too many requests. Please wait a moment and try again." },
      {
        status: 429,
        headers: { "Retry-After": Math.ceil(resetMs / 1000).toString() },
      }
    );
  }

  try {
    const body = await request.json().catch(() => null);
    const result = videosRequestSchema.safeParse(body);

    if (!result.success) {
      const firstError = result.error.issues[0];
      return NextResponse.json(
        { success: false, error: firstError?.message ?? "Invalid request body." },
        { status: 400 }
      );
    }

    const { channelId: _channelId, uploadsPlaylistId, maxResults } = result.data;

    const videos = await fetchRecentVideos(uploadsPlaylistId, maxResults);

    return NextResponse.json({
      success: true,
      data: {
        videos,
        totalResults: videos.length,
      },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("[/api/youtube/videos]", message);
    return NextResponse.json(
      { success: false, error: "Failed to fetch videos. Please try again." },
      { status: 500 }
    );
  }
}
