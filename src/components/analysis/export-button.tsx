"use client";

import { useState } from "react";
import { Download, ChevronDown, FileSpreadsheet, FileText, FileDown } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuLabel,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import type { VideoWithScore } from "@/types/video";
import type { ChannelInfo } from "@/types/channel";
import type { AnalysisSummary } from "@/types/analysis";
import { exportVideosToCsv } from "@/lib/analysis/csv-export";
import { exportVideosToExcel } from "@/lib/analysis/excel-export";
import { exportVideosToPdf } from "@/lib/analysis/pdf-export";

interface ExportButtonProps {
  videos: VideoWithScore[];
  channel: ChannelInfo;
  summary: AnalysisSummary;
}

export function ExportButton({ videos, channel, summary }: ExportButtonProps) {
  const [exporting, setExporting] = useState<"csv" | "excel" | "pdf" | null>(null);

  async function handleExport(format: "csv" | "excel" | "pdf") {
    setExporting(format);
    try {
      if (format === "csv") {
        exportVideosToCsv(videos, channel.customUrl);
      } else if (format === "excel") {
        exportVideosToExcel(videos, channel, summary);
      } else {
        exportVideosToPdf(videos, channel, summary);
      }
    } finally {
      setExporting(null);
    }
  }

  const label = exporting
    ? exporting === "pdf"
      ? "Opening…"
      : "Exporting…"
    : "Export";

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        className="inline-flex items-center gap-1.5 h-9 px-3.5 rounded-lg border border-border/60 bg-background text-sm font-medium text-foreground transition-all duration-150 hover:border-primary/40 hover:bg-primary/5 hover:text-primary disabled:opacity-60 disabled:cursor-not-allowed"
        disabled={!!exporting}
      >
        <Download className="h-3.5 w-3.5" />
        {label}
        <ChevronDown className="h-3 w-3 text-muted-foreground ml-0.5" />
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" sideOffset={6} className="w-52">
        <DropdownMenuGroup>
          <DropdownMenuLabel>Export format</DropdownMenuLabel>

          <DropdownMenuItem onClick={() => handleExport("excel")}>
            <FileSpreadsheet className="h-4 w-4 text-emerald-500" />
            <div className="flex flex-col">
              <span className="font-medium">Excel (.xls)</span>
              <span className="text-[10px] text-muted-foreground">Styled spreadsheet with color coding</span>
            </div>
          </DropdownMenuItem>

          <DropdownMenuItem onClick={() => handleExport("pdf")}>
            <FileText className="h-4 w-4 text-red-500" />
            <div className="flex flex-col">
              <span className="font-medium">PDF Report</span>
              <span className="text-[10px] text-muted-foreground">Branded print-ready document</span>
            </div>
          </DropdownMenuItem>
        </DropdownMenuGroup>

        <DropdownMenuSeparator />

        <DropdownMenuItem onClick={() => handleExport("csv")}>
          <FileDown className="h-4 w-4 text-muted-foreground" />
          <div className="flex flex-col">
            <span className="font-medium">CSV (.csv)</span>
            <span className="text-[10px] text-muted-foreground">Raw data for custom analysis</span>
          </div>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
