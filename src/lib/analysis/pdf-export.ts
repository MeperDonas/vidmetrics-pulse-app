/**
 * PDF Export — Styled Print Window
 *
 * Opens a browser print dialog with a fully-branded, print-optimized HTML
 * document. When the user chooses "Save as PDF", the output looks like a
 * professional report.
 *
 * No external dependencies — pure HTML/CSS injected into a popup window.
 *
 * Visual design:
 *   • Indigo branded header with report title and export date
 *   • Channel overview section (avatar placeholder, key stats)
 *   • Four-metric summary strip
 *   • Full video table with color-coded scores and trending badges
 *   • Branded footer
 */

import type { VideoWithScore } from "@/types/video";
import type { ChannelInfo } from "@/types/channel";
import type { AnalysisSummary } from "@/types/analysis";
import { formatDuration, formatNumber } from "@/lib/utils";
import { escapeHtml } from "@/lib/security/sanitize";

function scoreColor(score: number): string {
  if (score >= 80) return "#059669";
  if (score >= 60) return "#2563eb";
  if (score >= 40) return "#d97706";
  return "#dc2626";
}

function scoreBg(score: number): string {
  if (score >= 80) return "#f0fdf4";
  if (score >= 60) return "#eff6ff";
  if (score >= 40) return "#fffbeb";
  return "#fef2f2";
}

function trendingBadgeStyle(status: string): string {
  switch (status) {
    case "viral":
      return `background:#fef2f2;color:#dc2626;border:1px solid #fecaca;font-weight:700`;
    case "hot":
      return `background:#fff7ed;color:#ea580c;border:1px solid #fed7aa;font-weight:700`;
    case "above_average":
      return `background:#f0fdf4;color:#059669;border:1px solid #bbf7d0`;
    default:
      return `background:#f8fafc;color:#94a3b8;border:1px solid #e2e8f0`;
  }
}

function trendingLabel(status: string): string {
  return status.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

export function exportVideosToPdf(
  videos: VideoWithScore[],
  channel: ChannelInfo,
  summary: AnalysisSummary
): void {
  const date = new Date().toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  const handle = escapeHtml(channel.customUrl || channel.title);

  const metricsHtml = [
    { label: "Avg Views / Video", value: formatNumber(summary.averageViews), color: "#2563eb" },
    { label: "Avg Engagement", value: `${summary.averageEngagementRate.toFixed(2)}%`, color: "#db2777" },
    { label: "Trending Videos", value: String(summary.trendingCount), color: "#059669" },
    {
      label: "Channel Score",
      value: `${summary.overallScore}/100`,
      color: scoreColor(summary.overallScore),
    },
  ]
    .map(
      (m) => `
      <div style="flex:1;min-width:0;background:#f8fafc;border:1px solid #e2e8f0;border-radius:10px;padding:14px 16px">
        <div style="font-size:10px;font-weight:600;color:#64748b;text-transform:uppercase;letter-spacing:.05em;margin-bottom:6px">${m.label}</div>
        <div style="font-size:22px;font-weight:800;color:${m.color};letter-spacing:-.02em">${m.value}</div>
      </div>`
    )
    .join("");

  const tableRowsHtml = videos
    .map((v, i) => {
      const isAlt = i % 2 === 1;
      const bg = isAlt ? "#f8fafc" : "#ffffff";
      const pubDate = new Date(v.publishedAt).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
      const scoreC = scoreColor(v.performanceScore);
      const scoreBgC = scoreBg(v.performanceScore);
      const trendStyle = trendingBadgeStyle(v.trendingStatus);
      const trend = trendingLabel(v.trendingStatus);

      return `
      <tr style="background:${bg}">
        <td style="padding:6px 8px;color:#94a3b8;font-size:10px;text-align:center">${i + 1}</td>
        <td style="padding:6px 8px;max-width:200px">
          <a href="https://www.youtube.com/watch?v=${v.id}" style="color:#4f46e5;text-decoration:none;font-weight:500;font-size:11px;display:block;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${escapeHtml(v.title)}</a>
        </td>
        <td style="padding:6px 8px;color:#64748b;font-size:10px;white-space:nowrap">${pubDate}</td>
        <td style="padding:6px 8px;color:#64748b;font-size:10px;text-align:center;font-family:monospace">${formatDuration(v.duration)}</td>
        <td style="padding:6px 8px;text-align:right;font-size:10px;font-weight:600;color:#1e293b">${formatNumber(v.viewCount)}</td>
        <td style="padding:6px 8px;text-align:right;font-size:10px;color:#475569">${formatNumber(v.likeCount)}</td>
        <td style="padding:6px 8px;text-align:right;font-size:10px;color:#475569">${v.engagementRate.toFixed(2)}%</td>
        <td style="padding:6px 8px;text-align:right;font-size:10px;color:#475569">${formatNumber(Math.round(v.viewsPerDay))}</td>
        <td style="padding:6px 4px;text-align:center">
          <span style="display:inline-block;padding:2px 6px;border-radius:6px;font-size:10px;font-weight:700;background:${scoreBgC};color:${scoreC}">${v.performanceScore}</span>
        </td>
        <td style="padding:6px 4px;text-align:center">
          <span style="display:inline-block;padding:2px 6px;border-radius:999px;font-size:9px;white-space:nowrap;${trendStyle}">${trend}</span>
        </td>
      </tr>`;
    })
    .join("");

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"/>
  <title>VidMetrics Report — ${escapeHtml(channel.title)}</title>
  <style>
    @page {
      size: A4 landscape;
      margin: 1.2cm 1.4cm;
    }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif;
      color: #1e293b;
      background: #fff;
      font-size: 11px;
      line-height: 1.4;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }

    /* Header */
    .report-header {
      background: linear-gradient(135deg, #4f46e5 0%, #6366f1 100%);
      border-radius: 12px 12px 0 0;
      padding: 22px 28px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 0;
    }
    .report-header .brand {
      color: #fff;
    }
    .report-header .brand h1 {
      font-size: 22px;
      font-weight: 800;
      letter-spacing: -.03em;
    }
    .report-header .brand p {
      font-size: 11px;
      color: #c7d2fe;
      margin-top: 2px;
    }
    .report-header .meta {
      text-align: right;
      color: #c7d2fe;
      font-size: 10px;
    }
    .report-header .meta strong {
      display: block;
      color: #fff;
      font-size: 12px;
    }

    /* Channel section */
    .channel-section {
      background: #f1f5f9;
      border-left: 4px solid #6366f1;
      padding: 14px 20px;
      display: flex;
      align-items: center;
      gap: 20px;
      margin-bottom: 16px;
    }
    .channel-avatar {
      width: 48px;
      height: 48px;
      border-radius: 50%;
      background: linear-gradient(135deg, #6366f1, #8b5cf6);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 20px;
      font-weight: 800;
      color: #fff;
      flex-shrink: 0;
    }
    .channel-info h2 {
      font-size: 16px;
      font-weight: 800;
      color: #1e293b;
    }
    .channel-info p {
      color: #64748b;
      font-size: 11px;
      margin-top: 2px;
    }
    .channel-meta {
      margin-left: auto;
      display: flex;
      gap: 24px;
    }
    .channel-meta-item {
      text-align: center;
    }
    .channel-meta-item .val {
      font-size: 14px;
      font-weight: 700;
      color: #1e293b;
    }
    .channel-meta-item .key {
      font-size: 9px;
      color: #94a3b8;
      text-transform: uppercase;
      letter-spacing: .05em;
    }

    /* Metrics strip */
    .metrics-strip {
      display: flex;
      gap: 10px;
      margin-bottom: 16px;
    }

    /* Section title */
    .section-title {
      font-size: 10px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: .08em;
      color: #94a3b8;
      margin-bottom: 6px;
    }

    /* Table */
    table {
      width: 100%;
      border-collapse: collapse;
      font-size: 10.5px;
    }
    thead th {
      background: #312e81;
      color: #fff;
      padding: 8px 8px;
      font-size: 9.5px;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: .04em;
      text-align: left;
      border-bottom: 2px solid #6366f1;
    }
    thead th:nth-child(5),
    thead th:nth-child(6),
    thead th:nth-child(7),
    thead th:nth-child(8) {
      text-align: right;
    }
    thead th:nth-child(9),
    thead th:nth-child(10) {
      text-align: center;
    }
    tbody tr:last-child td {
      border-bottom: none;
    }
    tbody td {
      border-bottom: 1px solid #e2e8f0;
      vertical-align: middle;
    }

    /* Footer */
    .report-footer {
      margin-top: 16px;
      text-align: center;
      color: #94a3b8;
      font-size: 9px;
      padding-top: 10px;
      border-top: 1px solid #e2e8f0;
    }

    @media print {
      body { font-size: 10px; }
      .report-header { border-radius: 0; }
      a { text-decoration: none; }
    }
  </style>
</head>
<body>

  <div class="report-header">
    <div class="brand">
      <h1>VidMetrics Pulse</h1>
      <p>YouTube Competitor Analysis Report</p>
    </div>
    <div class="meta">
      <strong>${escapeHtml(channel.title)}</strong>
      ${handle}<br/>
      Exported ${date}
    </div>
  </div>

  <div style="height:4px;background:linear-gradient(90deg,#6366f1,#8b5cf6,#a855f7);margin-bottom:16px;border-radius:0 0 4px 4px"></div>

  <div class="channel-section">
    <div class="channel-avatar">${escapeHtml(channel.title.charAt(0).toUpperCase())}</div>
    <div class="channel-info">
      <h2>${escapeHtml(channel.title)}</h2>
      <p>${handle}</p>
    </div>
    <div class="channel-meta">
      <div class="channel-meta-item">
        <div class="val">${formatNumber(channel.subscriberCount)}</div>
        <div class="key">Subscribers</div>
      </div>
      <div class="channel-meta-item">
        <div class="val">${formatNumber(channel.videoCount)}</div>
        <div class="key">Total Videos</div>
      </div>
      <div class="channel-meta-item">
        <div class="val">${formatNumber(channel.viewCount)}</div>
        <div class="key">Total Views</div>
      </div>
    </div>
  </div>

  <div class="section-title">Analysis Summary</div>
  <div class="metrics-strip">
    ${metricsHtml}
  </div>

  <div class="section-title">${videos.length} Videos Analyzed</div>
  <table>
    <thead>
      <tr>
        <th style="width:28px">#</th>
        <th>Title</th>
        <th style="white-space:nowrap">Published</th>
        <th style="text-align:center">Duration</th>
        <th>Views</th>
        <th>Likes</th>
        <th>Engmt %</th>
        <th style="white-space:nowrap">Views/Day</th>
        <th style="text-align:center">Score</th>
        <th style="text-align:center">Trending</th>
      </tr>
    </thead>
    <tbody>
      ${tableRowsHtml}
    </tbody>
  </table>

  <div class="report-footer">
    Generated by VidMetrics Pulse — YouTube Competitor Analytics &nbsp;·&nbsp; ${date}
  </div>

  <script>
    window.onload = function() { window.print(); };
  </script>
</body>
</html>`;

  const win = window.open("", "_blank", "width=1200,height=800");
  if (!win) {
    alert("Please allow popups to generate the PDF report.");
    return;
  }
  win.document.write(html);
  win.document.close();
}
