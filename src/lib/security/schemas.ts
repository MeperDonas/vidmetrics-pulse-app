import { z } from "zod";

export const channelRequestSchema = z.object({
  url: z.string().min(1).max(500).trim(),
});

export const videosRequestSchema = z.object({
  channelId: z.string().min(1).max(100),
  uploadsPlaylistId: z.string().min(1).max(100),
  maxResults: z.number().int().min(1).max(50).optional().default(50),
});

export type ChannelRequestInput = z.infer<typeof channelRequestSchema>;
export type VideosRequestInput = z.infer<typeof videosRequestSchema>;
