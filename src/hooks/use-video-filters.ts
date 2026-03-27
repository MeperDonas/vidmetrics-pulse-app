"use client";

/**
 * useVideoFilters
 *
 * Manages client-side sort, filter, and search state over a VideoWithScore[].
 * Includes content-type separation: "all" | "videos" | "shorts"
 * (Shorts = duration < 60 seconds, per YouTube's own definition).
 */

import { useState, useMemo } from "react";
import { subDays } from "date-fns";
import type { VideoWithScore } from "@/types/video";
import type { SortField, SortDirection, DateRange } from "@/types/analysis";
import { parseDurationSeconds } from "@/lib/utils";

export type ContentType = "all" | "videos" | "shorts";

interface UseVideoFiltersReturn {
  filteredVideos: VideoWithScore[];
  sortField: SortField;
  sortDirection: SortDirection;
  dateRange: DateRange;
  searchQuery: string;
  contentType: ContentType;
  videosCount: number;
  shortsCount: number;
  setSortField: (field: SortField) => void;
  setSortDirection: (dir: SortDirection) => void;
  setDateRange: (range: DateRange) => void;
  setSearchQuery: (query: string) => void;
  setContentType: (type: ContentType) => void;
  resetFilters: () => void;
}

export function useVideoFilters(videos: VideoWithScore[]): UseVideoFiltersReturn {
  const [sortField, setSortField] = useState<SortField>("performanceScore");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");
  const [dateRange, setDateRange] = useState<DateRange>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [contentType, setContentType] = useState<ContentType>("all");

  // Stable short/video split (computed once, no filters applied)
  const { videosCount, shortsCount } = useMemo(() => {
    let vCount = 0;
    let sCount = 0;
    for (const v of videos) {
      if (parseDurationSeconds(v.duration) < 60) sCount++;
      else vCount++;
    }
    return { videosCount: vCount, shortsCount: sCount };
  }, [videos]);

  const filteredVideos = useMemo(() => {
    let result = [...videos];

    // Content-type filter — applied first
    if (contentType === "shorts") {
      result = result.filter((v) => parseDurationSeconds(v.duration) < 60);
    } else if (contentType === "videos") {
      result = result.filter((v) => parseDurationSeconds(v.duration) >= 60);
    }

    // Date range filter
    if (dateRange !== "all") {
      const days = parseInt(dateRange, 10);
      const cutoff = subDays(new Date(), days);
      result = result.filter((v) => new Date(v.publishedAt) >= cutoff);
    }

    // Search filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter((v) => v.title.toLowerCase().includes(q));
    }

    // Sorting
    result.sort((a, b) => {
      const aVal =
        sortField === "publishedAt"
          ? new Date(a.publishedAt).getTime()
          : (a[sortField] as number);
      const bVal =
        sortField === "publishedAt"
          ? new Date(b.publishedAt).getTime()
          : (b[sortField] as number);
      return sortDirection === "desc" ? bVal - aVal : aVal - bVal;
    });

    return result;
  }, [videos, contentType, sortField, sortDirection, dateRange, searchQuery]);

  const resetFilters = () => {
    setSortField("performanceScore");
    setSortDirection("desc");
    setDateRange("all");
    setSearchQuery("");
    // contentType intentionally NOT reset — it's a primary navigation choice
  };

  return {
    filteredVideos,
    sortField,
    sortDirection,
    dateRange,
    searchQuery,
    contentType,
    videosCount,
    shortsCount,
    setSortField,
    setSortDirection,
    setDateRange,
    setSearchQuery,
    setContentType,
    resetFilters,
  };
}
