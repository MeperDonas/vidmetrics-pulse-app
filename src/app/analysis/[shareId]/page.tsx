/**
 * /analysis/[shareId]
 *
 * Shareable analysis page. Decodes the shareId to extract a channel ID,
 * then re-fetches fresh data. No database required.
 */

import { decodeShareId } from "@/lib/share/encoder";
import { SharedAnalysisView } from "./shared-analysis-view";

interface PageProps {
  params: Promise<{ shareId: string }>;
}

export default async function SharedAnalysisPage({ params }: PageProps) {
  const { shareId } = await params;
  const decoded = decodeShareId(shareId);

  if (!decoded) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <p className="text-muted-foreground">Invalid or expired share link.</p>
      </div>
    );
  }

  return (
    <SharedAnalysisView
      channelId={decoded.channelId}
      originalTimestamp={decoded.timestamp}
    />
  );
}
