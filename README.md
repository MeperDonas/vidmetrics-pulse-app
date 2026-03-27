# VidMetrics Pulse

**YouTube Competitor Analysis Tool** — Vibe Coder Product Developer Challenge

Instantly analyze any YouTube channel to see which videos are crushing it. Paste a channel URL and get views, engagement rates, trending indicators, performance scores, and charts — all in seconds.

---

## Features

- **Channel analysis** — paste any YouTube channel URL (handles all URL formats)
- **Video metrics** — views, likes, comments, engagement rate per video
- **Trending indicators** — Z-score algorithm identifies videos outperforming the channel's own baseline
- **Performance scores** — composite 0–100 metric across views, engagement, consistency, and growth velocity
- **Charts** — views over time (area), top engagement (bar), performance radar, growth trend, content breakdown by format
- **Sorting & filtering** — by any metric, date range, or free-text search
- **Video segmentation** — toggle between All / Videos / Shorts with grid and list views
- **Export** — CSV, Excel, and PDF download for any channel analysis
- **Shareable links** — base64-encoded URLs, no database required
- **Dark / light mode** — system preference + manual toggle
- **Responsive** — mobile-first, works on any screen size

---

## Tech Stack

| Layer | Choice | Why |
|-------|--------|-----|
| Framework | Next.js 16 (App Router) | SSR for SEO, API routes keep key server-side |
| Styling | Tailwind CSS + shadcn/ui | Required + fast polished SaaS UI |
| Charts | Recharts | React-native, lightweight, good TypeScript support |
| Data | YouTube Data API v3 | Official, reliable, well-documented |
| Deploy | Vercel | Zero-config Next.js, instant globals |

---

## Local Setup

### Prerequisites

- Node.js 18+
- A YouTube Data API v3 key ([get one here](https://console.cloud.google.com/apis/credentials))

### Steps

```bash
# 1. Clone the repo
git clone https://github.com/MeperDonas/vidmetrics-pulse-app.git
cd vidmetrics-pulse-app

# 2. Install dependencies
npm install

# 3. Set your API key
cp .env.example .env.local
# then edit .env.local and add your YOUTUBE_API_KEY

# 4. Run the dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) and paste any YouTube channel URL.

### Environment Variables

| Variable | Description |
|----------|-------------|
| `YOUTUBE_API_KEY` | YouTube Data API v3 key (required) |

---

## Architecture

### How the YouTube API integration works

Most YouTube analytics tools use `search.list` which costs **100 quota units per call** — meaning you burn through the 10,000 unit daily limit after just 100 analyses.

VidMetrics Pulse uses the **uploads playlist strategy** instead:

```
channels.list        → 1–3 units  (channel info + uploads playlist ID)
playlistItems.list   → 3 units    (video IDs from uploads playlist)
videos.list          → 1 unit     (full stats for up to 50 videos)
─────────────────────────────────
Total per analysis: ~5–8 units    (vs 100+ with search)
```

This delivers ~97% quota savings — supporting ~1,200 analyses per day on the free tier.

### Trending detection

Uses a **Z-score algorithm** comparing each video's daily view velocity against the channel's own baseline. A video is "viral" if its views-per-day is 2+ standard deviations above the channel mean — so the metric is always relative to that specific channel, not some arbitrary threshold.

Videos under 7 days old get a 1.5× recency multiplier since YouTube's algorithm pushes fresh content harder.

### Performance score

A composite **0–100 metric** with four equally weighted dimensions:

| Dimension | Weight | What it measures |
|-----------|--------|-----------------|
| Views score | 25 pts | Percentile rank within the channel |
| Engagement score | 25 pts | Likes + comments / views vs benchmarks |
| Consistency score | 25 pts | Video views vs channel average |
| Growth score | 25 pts | Views-per-day vs channel average |

### Share links

Shareable analysis URLs encode only the channel ID in base64url. No database, no persistence — shared links always show fresh data. The timestamp embedded in the URL shows how old the original analysis was.

---

## How I Built This

**Total build time:** ~8 hours from blank repo to deployed product.

**AI tools used:** Claude (architecture, component scaffolding, algorithm design), Cursor (inline completions while wiring components together).

**What I automated/accelerated:**
- Full TypeScript type system designed in a single planning session
- Algorithm implementation (Z-score trending, composite scoring) — drafted by AI, verified and refined by me
- Boilerplate component structure (hooks, API routes, shared utilities)
- README and documentation

**What I made the human decisions on:**
- Using the playlistItems API over search (quota efficiency tradeoff)
- Z-score approach for trending (channel-relative, not arbitrary thresholds)
- Choosing shadcn/ui v4 with Base UI (newer, more composable)
- Progressive loading phases UX (showing real channel data while videos load)
- Base64url share encoding without a database

---

## Product Thinking

**What I'd add with more time:**

1. **Multi-channel comparison** — analyze 2–3 channels side by side, compare engagement curves
2. **Historical tracking** — store analyses over time to show channel trajectory (requires Supabase/Postgres)
3. **Video topic clustering** — use AI to group videos by theme and show which topics perform best
4. **Notification alerts** — "this competitor just posted a viral video" via email/Slack
5. **Thumbnail analysis** — CV-powered thumbnail effectiveness scoring
6. **Best time to post** — analyze publish times vs performance to surface optimal upload windows

**What feels missing from v1:**

- No pagination — currently capped at 50 most recent videos
- Charts are read-only — clicking a data point should open the video or highlight it in the list
- No cross-channel benchmarking — all metrics are relative to the channel itself, not industry averages

**What I'd improve in v2:**

- Replace base64 share links with short URLs backed by a real datastore
- Add auth so teams can save and revisit past analyses
- Keyboard navigation throughout (currently mouse-first)

---

## Deployment

The app is deployed on Vercel. To deploy your own:

1. Fork the repo
2. Import it in [vercel.com](https://vercel.com)
3. Add `YOUTUBE_API_KEY` as an environment variable
4. Deploy — that's it

---

*Built for the VidMetrics Vibe Coder Product Developer challenge.*
