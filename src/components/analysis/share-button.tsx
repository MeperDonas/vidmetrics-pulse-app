"use client";

import { Share2, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useShareLink } from "@/hooks/use-share-link";

interface ShareButtonProps {
  channelId: string;
}

export function ShareButton({ channelId }: ShareButtonProps) {
  const { copied, generateAndCopy } = useShareLink();

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={() => generateAndCopy(channelId)}
      className="h-9"
    >
      {copied ? (
        <>
          <Check className="h-3.5 w-3.5 mr-1.5 text-emerald-500" />
          Copied!
        </>
      ) : (
        <>
          <Share2 className="h-3.5 w-3.5 mr-1.5" />
          Share
        </>
      )}
    </Button>
  );
}
