/**
 * POST /api/youtube/channel
 *
 * Resolves a YouTube channel URL to full channel information.
 * Runs server-side to keep the API key out of the browser bundle.
 *
 * Body:   { url: string }
 * Returns: ChannelResponse
 *
 * Security: rate limited (10 req/min/IP), Zod-validated input, payload size guard.
 */

import { NextResponse } from "next/server";
import type { ChannelResponse } from "@/types/api";
import { parseChannelUrl } from "@/lib/youtube/url-parser";
import { resolveChannelId, fetchChannelInfo } from "@/lib/youtube/client";
import { createRateLimiter } from "@/lib/security/rate-limit";
import { channelRequestSchema } from "@/lib/security/schemas";

const limiter = createRateLimiter({ windowMs: 60_000, maxRequests: 10 });

export async function POST(request: Request): Promise<NextResponse<ChannelResponse>> {
  // Payload size guard
  const contentLength = parseInt(request.headers.get("content-length") ?? "0", 10);
  if (contentLength > 1024) {
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
    const result = channelRequestSchema.safeParse(body);

    if (!result.success) {
      const firstError = result.error.issues[0];
      return NextResponse.json(
        { success: false, error: firstError?.message ?? "Invalid request body." },
        { status: 400 }
      );
    }

    const parsed = parseChannelUrl(result.data.url);
    if (!parsed) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Invalid YouTube channel URL. Try formats like youtube.com/@handle or youtube.com/channel/UCxxxxxx",
        },
        { status: 400 }
      );
    }

    const channelId = await resolveChannelId(parsed);
    const channel = await fetchChannelInfo(channelId);

    return NextResponse.json({ success: true, data: channel });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";

    if (message.includes("Channel not found")) {
      return NextResponse.json(
        { success: false, error: "Channel not found. Double-check the URL and try again." },
        { status: 404 }
      );
    }

    console.error("[/api/youtube/channel]", message);
    return NextResponse.json(
      { success: false, error: "Failed to fetch channel data. Please try again." },
      { status: 500 }
    );
  }
}
