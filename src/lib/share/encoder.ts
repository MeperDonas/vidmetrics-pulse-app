/**
 * Share Link Encoder/Decoder
 *
 * Encodes a channel ID and analysis timestamp into a URL-safe base64 string.
 * No database required — the channel ID is re-fetched on load, ensuring
 * shared links always show fresh data.
 *
 * Format: /analysis/[shareId]
 */

interface SharePayload {
  cid: string;
  ts: number;
}

const SHARE_LINK_TTL_MS = 30 * 24 * 60 * 60 * 1000; // 30 days

export function encodeShareId(channelId: string): string {
  const payload: SharePayload = { cid: channelId, ts: Date.now() };
  const json = JSON.stringify(payload);
  return btoa(json).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

export function decodeShareId(
  shareId: string
): { channelId: string; timestamp: number } | null {
  try {
    const padded = shareId.replace(/-/g, "+").replace(/_/g, "/");
    const padLength = padded.length % 4;
    const json = atob(padded + (padLength ? "=".repeat(4 - padLength) : ""));
    const payload = JSON.parse(json) as SharePayload;
    if (!payload.cid || typeof payload.ts !== "number") return null;
    if (Date.now() - payload.ts > SHARE_LINK_TTL_MS) return null;
    return { channelId: payload.cid, timestamp: payload.ts };
  } catch {
    return null;
  }
}
