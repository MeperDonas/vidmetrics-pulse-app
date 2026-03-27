import { Flame, TrendingUp, ArrowUp } from "lucide-react";
import type { TrendingStatus } from "@/types/video";
import { trendingColor } from "@/lib/utils";

interface TrendingIndicatorProps {
  status: TrendingStatus;
  compact?: boolean;
}

const STATUS_CONFIG: Record<
  TrendingStatus,
  { label: string; icon: React.ReactNode } | null
> = {
  viral: { label: "Viral", icon: <Flame className="h-3 w-3" /> },
  hot: { label: "Hot", icon: <Flame className="h-3 w-3" /> },
  above_average: { label: "Trending", icon: <TrendingUp className="h-3 w-3" /> },
  average: null,
  below_average: null,
};

export function TrendingIndicator({
  status,
  compact = false,
}: TrendingIndicatorProps) {
  const config = STATUS_CONFIG[status];
  if (!config) return null;

  const colors = trendingColor(status);

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-medium ${colors.bg} ${colors.text} ${colors.border}`}
    >
      {config.icon}
      {!compact && config.label}
    </span>
  );
}
