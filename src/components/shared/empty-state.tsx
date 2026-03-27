"use client";

import { Search, TrendingUp, BarChart2, Download } from "lucide-react";

const FEATURES = [
  { icon: <TrendingUp className="h-4 w-4" />, text: "Trending indicators" },
  { icon: <BarChart2 className="h-4 w-4" />, text: "Performance charts" },
  { icon: <Download className="h-4 w-4" />, text: "CSV export" },
];

export function EmptyState() {
  return (
    <div className="flex flex-col items-center gap-10 py-10 sm:py-14 text-center">
      {/* Icon cluster */}
      <div className="relative">
        <div className="flex h-20 w-20 items-center justify-center rounded-2xl border border-primary/20 bg-primary/5 shadow-xl shadow-primary/10 ring-1 ring-primary/10">
          <Search className="h-9 w-9 text-primary" />
        </div>
        {/* Floating decorative dots */}
        <span className="absolute -top-1 -right-1 h-3 w-3 rounded-full bg-emerald-500 ring-2 ring-background" />
        <span className="absolute -bottom-1 -left-1 h-2 w-2 rounded-full bg-primary/60 ring-2 ring-background" />
      </div>

      {/* Text */}
      <div className="space-y-3 max-w-sm">
        <h2 className="text-2xl font-extrabold tracking-tight text-foreground">
          Drop a channel URL above
        </h2>
        <p className="text-sm text-muted-foreground leading-relaxed">
          Get views, engagement, trending signals, and performance scores for
          any YouTube channel — in seconds.
        </p>
      </div>

      {/* Feature pills */}
      <div className="flex flex-wrap justify-center gap-2">
        {FEATURES.map((f) => (
          <span
            key={f.text}
            className="inline-flex items-center gap-1.5 rounded-full border border-border/60 bg-muted/50 px-3 py-1.5 text-xs font-medium text-muted-foreground"
          >
            {f.icon}
            {f.text}
          </span>
        ))}
      </div>

    </div>
  );
}
