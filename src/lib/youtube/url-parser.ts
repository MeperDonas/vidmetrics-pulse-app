/**
 * YouTube URL Parser
 *
 * Handles all known YouTube channel URL formats and returns a normalized
 * identifier that can be used to query the YouTube Data API v3.
 */

export type ParsedChannelUrl =
  | { type: "channel_id"; value: string }
  | { type: "handle"; value: string }
  | { type: "custom_url"; value: string }
  | { type: "username"; value: string };

const CHANNEL_ID_REGEX = /^UC[\w-]{22}$/;

/**
 * Strips protocol, www, and trailing path segments that aren't part of the
 * channel identifier (e.g., /videos, /shorts, /about).
 */
function normalizeUrl(input: string): string {
  return input
    .trim()
    .replace(/^https?:\/\/(www\.)?/i, "")
    .replace(/^youtube\.com\//i, "")
    .replace(/\/(videos|shorts|about|community|playlists|featured)\/?$/, "")
    .replace(/\/$/, "");
}

/**
 * Parses a YouTube channel URL or identifier into a typed structure.
 * Returns null if the input cannot be recognized as a valid channel reference.
 *
 * Supported formats:
 *   https://www.youtube.com/@handle
 *   https://youtube.com/channel/UCxxxxxx
 *   https://www.youtube.com/c/CustomName
 *   https://www.youtube.com/user/username
 *   @handle           (bare handle)
 *   UCxxxxxx          (bare channel ID)
 */
export function parseChannelUrl(input: string): ParsedChannelUrl | null {
  const normalized = normalizeUrl(input);

  // Bare channel ID — matches the UCxxxxxxx format exactly
  if (CHANNEL_ID_REGEX.test(normalized)) {
    return { type: "channel_id", value: normalized };
  }

  // Bare handle — @username without a full URL
  if (/^@[\w.-]+$/.test(normalized)) {
    return { type: "handle", value: normalized };
  }

  // /channel/UCxxxxxx
  const channelMatch = normalized.match(/^channel\/(UC[\w-]{22})$/);
  if (channelMatch) {
    return { type: "channel_id", value: channelMatch[1] };
  }

  // /@handle
  const handleMatch = normalized.match(/^@([\w.-]+)$/);
  if (handleMatch) {
    return { type: "handle", value: `@${handleMatch[1]}` };
  }

  // /c/CustomName
  const customMatch = normalized.match(/^c\/([\w.-]+)$/);
  if (customMatch) {
    return { type: "custom_url", value: customMatch[1] };
  }

  // /user/username
  const userMatch = normalized.match(/^user\/([\w.-]+)$/);
  if (userMatch) {
    return { type: "username", value: userMatch[1] };
  }

  return null;
}
