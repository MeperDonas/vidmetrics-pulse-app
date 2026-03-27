"use client";

import { useEffect } from "react";
import { formatDistanceToNow } from "date-fns";
import { Clock } from "lucide-react";
import { AnalysisDashboard } from "@/components/analysis/analysis-dashboard";
import { useChannelAnalysis } from "@/hooks/use-channel-analysis";

interface SharedAnalysisViewProps {
  channelId: string;
  originalTimestamp: number;
}

export function SharedAnalysisView({
  channelId,
  originalTimestamp,
}: SharedAnalysisViewProps) {
  const { analyze } = useChannelAnalysis();

  useEffect(() => {
    // Auto-analyze on mount using the channel ID directly
    analyze(channelId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [channelId]);

  const analysisAge = formatDistanceToNow(new Date(originalTimestamp), {
    addSuffix: true,
  });

  return (
    <div className="space-y-0">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4">
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <Clock className="h-3 w-3" />
          <span>Link shared {analysisAge} — showing fresh data</span>
        </div>
      </div>
      <AnalysisDashboard />
    </div>
  );
}
