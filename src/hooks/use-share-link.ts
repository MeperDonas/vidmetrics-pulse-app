"use client";

/**
 * useShareLink
 *
 * Generates a shareable analysis URL and copies it to the clipboard.
 * Uses base64url encoding — no database required.
 */

import { useState, useCallback } from "react";
import { encodeShareId } from "@/lib/share/encoder";

interface UseShareLinkReturn {
  copied: boolean;
  generateAndCopy: (channelId: string) => Promise<void>;
}

export function useShareLink(): UseShareLinkReturn {
  const [copied, setCopied] = useState(false);

  const generateAndCopy = useCallback(async (channelId: string) => {
    const shareId = encodeShareId(channelId);
    const url = `${window.location.origin}/analysis/${shareId}`;

    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, []);

  return { copied, generateAndCopy };
}
