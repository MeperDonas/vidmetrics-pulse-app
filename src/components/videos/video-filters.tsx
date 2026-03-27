"use client";

import { Search, SlidersHorizontal, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { SortField, SortDirection, DateRange } from "@/types/analysis";
import type { ContentType } from "@/hooks/use-video-filters";

interface VideoFiltersProps {
  sortField: SortField;
  sortDirection: SortDirection;
  dateRange: DateRange;
  searchQuery: string;
  contentType: ContentType;
  onSortFieldChange: (field: SortField) => void;
  onSortDirectionChange: (dir: SortDirection) => void;
  onDateRangeChange: (range: DateRange) => void;
  onSearchChange: (q: string) => void;
  onReset: () => void;
  resultCount: number;
  totalCount: number;
}

export function VideoFilters({
  sortField,
  sortDirection,
  dateRange,
  searchQuery,
  contentType,
  onSortFieldChange,
  onSortDirectionChange,
  onDateRangeChange,
  onSearchChange,
  onReset,
  resultCount,
  totalCount,
}: VideoFiltersProps) {
  const isFiltered =
    sortField !== "performanceScore" ||
    sortDirection !== "desc" ||
    dateRange !== "all" ||
    searchQuery !== "";

  const itemLabel = contentType === "shorts" ? "Shorts" : "videos";

  return (
    <div className="space-y-3">
      <div className="flex flex-col sm:flex-row gap-2">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
          <Input
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder={`Search ${itemLabel}...`}
            className="pl-9 h-9"
          />
          {searchQuery && (
            <button
              onClick={() => onSearchChange("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              aria-label="Clear search"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        {/* Sort field */}
        <Select value={sortField} onValueChange={(v) => onSortFieldChange(v as SortField)}>
          <SelectTrigger className="h-9 w-full sm:w-44">
            <SlidersHorizontal className="h-3.5 w-3.5 mr-1.5 text-muted-foreground" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="performanceScore">Score</SelectItem>
            <SelectItem value="viewCount">Views</SelectItem>
            <SelectItem value="likeCount">Likes</SelectItem>
            <SelectItem value="commentCount">Comments</SelectItem>
            <SelectItem value="engagementRate">Engagement</SelectItem>
            <SelectItem value="publishedAt">Date</SelectItem>
          </SelectContent>
        </Select>

        {/* Sort direction */}
        <Select value={sortDirection} onValueChange={(v) => onSortDirectionChange(v as SortDirection)}>
          <SelectTrigger className="h-9 w-full sm:w-36">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="desc">High → Low</SelectItem>
            <SelectItem value="asc">Low → High</SelectItem>
          </SelectContent>
        </Select>

        {/* Date range */}
        <Select value={dateRange} onValueChange={(v) => onDateRangeChange(v as DateRange)}>
          <SelectTrigger className="h-9 w-full sm:w-36">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All time</SelectItem>
            <SelectItem value="7d">Last 7 days</SelectItem>
            <SelectItem value="30d">Last 30 days</SelectItem>
            <SelectItem value="90d">Last 90 days</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Showing{" "}
          <span className="font-medium text-foreground">{resultCount}</span>
          {resultCount !== totalCount && ` of ${totalCount}`} {itemLabel}
        </p>
        {isFiltered && (
          <Button variant="ghost" size="sm" onClick={onReset} className="h-7 text-xs">
            <X className="h-3 w-3 mr-1" />
            Reset filters
          </Button>
        )}
      </div>
    </div>
  );
}
