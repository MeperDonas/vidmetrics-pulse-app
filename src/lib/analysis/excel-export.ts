/**
 * Excel Export — SpreadsheetML (Office 2003 XML)
 *
 * Generates a styled .xls file using the SpreadsheetML XML format, which is
 * supported by Excel, LibreOffice Calc, and Google Sheets. No external
 * dependencies required — the output is a pure XML string.
 *
 * Visual design:
 *   • Branded header section (indigo)
 *   • Channel summary block
 *   • Column headers with dark background
 *   • Alternating row shading
 *   • Color-coded performance scores (green → red)
 *   • Color-coded trending status badges
 */

import type { VideoWithScore } from "@/types/video";
import type { ChannelInfo } from "@/types/channel";
import type { AnalysisSummary } from "@/types/analysis";
import { formatDuration, formatNumber } from "@/lib/utils";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function esc(val: string | number): string {
  return String(val)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function cell(
  value: string | number,
  opts: {
    style?: string;
    type?: "String" | "Number";
    mergeAcross?: number;
    width?: number;
  } = {}
): string {
  const { style, type = "String", mergeAcross } = opts;
  const styleAttr = style ? ` ss:StyleID="${style}"` : "";
  const mergeAttr = mergeAcross ? ` ss:MergeAcross="${mergeAcross}"` : "";
  return `<Cell${styleAttr}${mergeAttr}><Data ss:Type="${type}">${esc(value)}</Data></Cell>`;
}

function emptyCell(count = 1): string {
  return `<Cell ss:Index="${count + 1}"/>`;
}

function scoreStyle(score: number): string {
  if (score >= 80) return "scoreHigh";
  if (score >= 60) return "scoreMid";
  if (score >= 40) return "scoreLow";
  return "scoreVeryLow";
}

function trendingStyle(status: string): string {
  switch (status) {
    case "viral": return "viral";
    case "hot": return "hot";
    case "above_average": return "above";
    default: return "neutral";
  }
}

function trendingLabel(status: string): string {
  return status.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

// ---------------------------------------------------------------------------
// Styles block
// ---------------------------------------------------------------------------

const STYLES = `
<Styles>
  <Style ss:ID="Default" ss:Name="Normal">
    <Alignment ss:Vertical="Center"/>
    <Font ss:FontName="Calibri" ss:Size="11" ss:Color="#1e293b"/>
  </Style>

  <!-- Branding / header -->
  <Style ss:ID="brand">
    <Font ss:Bold="1" ss:Color="#FFFFFF" ss:Size="18" ss:FontName="Calibri"/>
    <Interior ss:Color="#4f46e5" ss:Pattern="Solid"/>
    <Alignment ss:Vertical="Center"/>
  </Style>
  <Style ss:ID="brandSub">
    <Font ss:Color="#c7d2fe" ss:Size="11" ss:FontName="Calibri"/>
    <Interior ss:Color="#4f46e5" ss:Pattern="Solid"/>
    <Alignment ss:Vertical="Center"/>
  </Style>

  <!-- Section labels -->
  <Style ss:ID="sectionLabel">
    <Font ss:Bold="1" ss:Color="#4f46e5" ss:Size="10" ss:FontName="Calibri"/>
    <Interior ss:Color="#eef2ff" ss:Pattern="Solid"/>
    <Alignment ss:Vertical="Center"/>
    <Borders>
      <Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#c7d2fe"/>
    </Borders>
  </Style>

  <!-- Summary data cells -->
  <Style ss:ID="summaryKey">
    <Font ss:Bold="1" ss:Color="#64748b" ss:Size="10" ss:FontName="Calibri"/>
    <Interior ss:Color="#f8fafc" ss:Pattern="Solid"/>
    <Alignment ss:Vertical="Center"/>
  </Style>
  <Style ss:ID="summaryVal">
    <Font ss:Bold="1" ss:Color="#1e293b" ss:Size="13" ss:FontName="Calibri"/>
    <Interior ss:Color="#f8fafc" ss:Pattern="Solid"/>
    <Alignment ss:Vertical="Center"/>
  </Style>

  <!-- Table column headers -->
  <Style ss:ID="colHeader">
    <Font ss:Bold="1" ss:Color="#FFFFFF" ss:Size="10" ss:FontName="Calibri"/>
    <Interior ss:Color="#312e81" ss:Pattern="Solid"/>
    <Alignment ss:Vertical="Center"/>
    <Borders>
      <Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="2" ss:Color="#6366f1"/>
    </Borders>
  </Style>

  <!-- Table row — normal and alternating -->
  <Style ss:ID="rowNormal">
    <Font ss:FontName="Calibri" ss:Size="10" ss:Color="#334155"/>
    <Interior ss:Color="#FFFFFF" ss:Pattern="Solid"/>
    <Alignment ss:Vertical="Center" ss:WrapText="0"/>
  </Style>
  <Style ss:ID="rowAlt">
    <Font ss:FontName="Calibri" ss:Size="10" ss:Color="#334155"/>
    <Interior ss:Color="#f1f5f9" ss:Pattern="Solid"/>
    <Alignment ss:Vertical="Center" ss:WrapText="0"/>
  </Style>

  <!-- Number cells in normal/alt rows -->
  <Style ss:ID="numNormal">
    <Font ss:FontName="Calibri" ss:Size="10" ss:Color="#334155"/>
    <Interior ss:Color="#FFFFFF" ss:Pattern="Solid"/>
    <Alignment ss:Vertical="Center" ss:Horizontal="Right"/>
  </Style>
  <Style ss:ID="numAlt">
    <Font ss:FontName="Calibri" ss:Size="10" ss:Color="#334155"/>
    <Interior ss:Color="#f1f5f9" ss:Pattern="Solid"/>
    <Alignment ss:Vertical="Center" ss:Horizontal="Right"/>
  </Style>

  <!-- Performance score colors -->
  <Style ss:ID="scoreHigh">
    <Font ss:Bold="1" ss:Color="#059669" ss:FontName="Calibri" ss:Size="10"/>
    <Interior ss:Color="#f0fdf4" ss:Pattern="Solid"/>
    <Alignment ss:Vertical="Center" ss:Horizontal="Center"/>
  </Style>
  <Style ss:ID="scoreMid">
    <Font ss:Bold="1" ss:Color="#2563eb" ss:FontName="Calibri" ss:Size="10"/>
    <Interior ss:Color="#eff6ff" ss:Pattern="Solid"/>
    <Alignment ss:Vertical="Center" ss:Horizontal="Center"/>
  </Style>
  <Style ss:ID="scoreLow">
    <Font ss:Bold="1" ss:Color="#d97706" ss:FontName="Calibri" ss:Size="10"/>
    <Interior ss:Color="#fffbeb" ss:Pattern="Solid"/>
    <Alignment ss:Vertical="Center" ss:Horizontal="Center"/>
  </Style>
  <Style ss:ID="scoreVeryLow">
    <Font ss:Bold="1" ss:Color="#dc2626" ss:FontName="Calibri" ss:Size="10"/>
    <Interior ss:Color="#fef2f2" ss:Pattern="Solid"/>
    <Alignment ss:Vertical="Center" ss:Horizontal="Center"/>
  </Style>

  <!-- Trending status colors -->
  <Style ss:ID="viral">
    <Font ss:Bold="1" ss:Color="#dc2626" ss:FontName="Calibri" ss:Size="10"/>
    <Interior ss:Color="#fef2f2" ss:Pattern="Solid"/>
    <Alignment ss:Vertical="Center" ss:Horizontal="Center"/>
  </Style>
  <Style ss:ID="hot">
    <Font ss:Bold="1" ss:Color="#ea580c" ss:FontName="Calibri" ss:Size="10"/>
    <Interior ss:Color="#fff7ed" ss:Pattern="Solid"/>
    <Alignment ss:Vertical="Center" ss:Horizontal="Center"/>
  </Style>
  <Style ss:ID="above">
    <Font ss:Color="#059669" ss:FontName="Calibri" ss:Size="10"/>
    <Interior ss:Color="#f0fdf4" ss:Pattern="Solid"/>
    <Alignment ss:Vertical="Center" ss:Horizontal="Center"/>
  </Style>
  <Style ss:ID="neutral">
    <Font ss:Color="#94a3b8" ss:FontName="Calibri" ss:Size="10"/>
    <Interior ss:Color="#FFFFFF" ss:Pattern="Solid"/>
    <Alignment ss:Vertical="Center" ss:Horizontal="Center"/>
  </Style>
  <Style ss:ID="neutralAlt">
    <Font ss:Color="#94a3b8" ss:FontName="Calibri" ss:Size="10"/>
    <Interior ss:Color="#f1f5f9" ss:Pattern="Solid"/>
    <Alignment ss:Vertical="Center" ss:Horizontal="Center"/>
  </Style>

  <!-- Footer -->
  <Style ss:ID="footer">
    <Font ss:Italic="1" ss:Color="#94a3b8" ss:Size="9" ss:FontName="Calibri"/>
    <Alignment ss:Vertical="Center"/>
  </Style>
</Styles>`.trim();

// ---------------------------------------------------------------------------
// Column definitions
// ---------------------------------------------------------------------------

const COLUMNS = [
  { label: "#", width: 28 },
  { label: "Title", width: 220 },
  { label: "Published", width: 78 },
  { label: "Duration", width: 60 },
  { label: "Views", width: 72 },
  { label: "Likes", width: 62 },
  { label: "Comments", width: 72 },
  { label: "Engagement %", width: 90 },
  { label: "Views / Day", width: 75 },
  { label: "Performance", width: 80 },
  { label: "Trending", width: 90 },
  { label: "URL", width: 220 },
];

// ---------------------------------------------------------------------------
// Public export function
// ---------------------------------------------------------------------------

export function exportVideosToExcel(
  videos: VideoWithScore[],
  channel: ChannelInfo,
  summary: AnalysisSummary
): void {
  const date = new Date().toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  const dateShort = new Date().toISOString().split("T")[0];
  const handle = channel.customUrl || channel.title;
  const totalCols = COLUMNS.length - 1; // MergeAcross is 0-indexed

  const colDefs = COLUMNS.map(
    (c) => `<Column ss:Width="${c.width}"/>`
  ).join("\n        ");

  // Build header rows
  const headerRows = `
        <Row ss:Height="36">
          ${cell(`VidMetrics Pulse — Channel Analysis Report`, { style: "brand", mergeAcross: totalCols })}
        </Row>
        <Row ss:Height="20">
          ${cell(`Exported ${date} · ${videos.length} videos analyzed`, { style: "brandSub", mergeAcross: totalCols })}
        </Row>
        <Row ss:Height="6">
          ${cell("", { style: "brand", mergeAcross: totalCols })}
        </Row>

        <Row ss:Height="20">
          ${cell("CHANNEL OVERVIEW", { style: "sectionLabel", mergeAcross: totalCols })}
        </Row>
        <Row ss:Height="16">
          ${cell("Channel", { style: "summaryKey" })}
          ${cell(channel.title, { style: "summaryVal", mergeAcross: 2 })}
          ${cell("Handle", { style: "summaryKey" })}
          ${cell(handle, { style: "summaryVal", mergeAcross: 2 })}
          ${cell("Subscribers", { style: "summaryKey" })}
          ${cell(formatNumber(channel.subscriberCount), { style: "summaryVal", mergeAcross: 2 })}
          ${cell("Total Views", { style: "summaryKey" })}
          ${cell(formatNumber(channel.viewCount), { style: "summaryVal", mergeAcross: 2 })}
        </Row>
        <Row ss:Height="16">
          ${cell("Videos Analyzed", { style: "summaryKey" })}
          ${cell(summary.totalVideosAnalyzed, { style: "summaryVal", mergeAcross: 2 })}
          ${cell("Avg Views / Video", { style: "summaryKey" })}
          ${cell(formatNumber(summary.averageViews), { style: "summaryVal", mergeAcross: 2 })}
          ${cell("Avg Engagement", { style: "summaryKey" })}
          ${cell(`${summary.averageEngagementRate.toFixed(2)}%`, { style: "summaryVal", mergeAcross: 2 })}
          ${cell("Channel Score", { style: "summaryKey" })}
          ${cell(`${summary.overallScore}/100`, { style: scoreStyle(summary.overallScore), mergeAcross: 2 })}
        </Row>
        <Row ss:Height="8"/>

        <Row ss:Height="20">
          ${cell("VIDEO DATA", { style: "sectionLabel", mergeAcross: totalCols })}
        </Row>

        <Row ss:Height="22">
          ${COLUMNS.map((c) => cell(c.label, { style: "colHeader" })).join("")}
        </Row>`;

  // Build video data rows
  const videoRows = videos
    .map((v, i) => {
      const isAlt = i % 2 === 1;
      const rowStyle = isAlt ? "rowAlt" : "rowNormal";
      const numStyle = isAlt ? "numAlt" : "numNormal";
      const pubDate = new Date(v.publishedAt).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
      const trend = trendingLabel(v.trendingStatus);
      const tStyle =
        v.trendingStatus === "average" || v.trendingStatus === "below_average"
          ? isAlt ? "neutralAlt" : "neutral"
          : trendingStyle(v.trendingStatus);

      return `
        <Row ss:Height="16">
          ${cell(i + 1, { style: numStyle, type: "Number" })}
          ${cell(v.title, { style: rowStyle })}
          ${cell(pubDate, { style: rowStyle })}
          ${cell(formatDuration(v.duration), { style: rowStyle })}
          ${cell(v.viewCount, { style: numStyle, type: "Number" })}
          ${cell(v.likeCount, { style: numStyle, type: "Number" })}
          ${cell(v.commentCount, { style: numStyle, type: "Number" })}
          ${cell(v.engagementRate.toFixed(2), { style: numStyle })}
          ${cell(Math.round(v.viewsPerDay), { style: numStyle, type: "Number" })}
          ${cell(v.performanceScore, { style: scoreStyle(v.performanceScore), type: "Number" })}
          ${cell(trend, { style: tStyle })}
          ${cell(`https://www.youtube.com/watch?v=${v.id}`, { style: rowStyle })}
        </Row>`;
    })
    .join("");

  // Footer
  const footerRow = `
        <Row ss:Height="8"/>
        <Row ss:Height="16">
          ${cell(
            `Generated by VidMetrics Pulse · vidmetrics-pulse.vercel.app · ${date}`,
            { style: "footer", mergeAcross: totalCols }
          )}
        </Row>`;

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<?mso-application progid="Excel.Sheet"?>
<Workbook
  xmlns="urn:schemas-microsoft-com:office:spreadsheet"
  xmlns:x="urn:schemas-microsoft-com:office:excel"
  xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet"
  xmlns:html="http://www.w3.org/TR/REC-html40">
  ${STYLES}
  <Worksheet ss:Name="Channel Analysis">
    <Table>
      ${colDefs}
      ${headerRows}
      ${videoRows}
      ${footerRow}
    </Table>
    <WorksheetOptions xmlns="urn:schemas-microsoft-com:office:excel">
      <FreezePanes/>
      <FrozenNoSplit/>
      <SplitHorizontal>9</SplitHorizontal>
      <TopRowBottomPane>9</TopRowBottomPane>
      <ActivePane>2</ActivePane>
    </WorksheetOptions>
  </Worksheet>
</Workbook>`;

  const blob = new Blob([xml], {
    type: "application/vnd.ms-excel;charset=utf-8;",
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `vidmetrics-${handle.replace("@", "")}-${dateShort}.xls`;
  link.click();
  URL.revokeObjectURL(url);
}
