# VidMetrics Pulse — Written Submission

**Challenge:** Vibe Coder Product Developer Challenge
**Candidate:** [Your Name]
**Submitted:** March 2026

---

## Links

| | |
|---|---|
| **Live Demo** | [vidmetrics-pulse-app.vercel.app](https://vidmetrics-pulse-app.vercel.app) ← add your actual URL |
| **GitHub Repo** | [github.com/MeperDonas/vidmetrics-pulse-app](https://github.com/MeperDonas/vidmetrics-pulse-app) |
| **Loom Walkthrough** | [Add your Loom link here] |

---

## 1. Build Breakdown

### How long it took

**~8 hours** from blank repo to deployed product, working in focused sessions:

- ~1h: architecture planning, stack decisions, API strategy
- ~4h: core build (API routes, analysis algorithms, UI components)
- ~2h: polishing (charts, export, share links, dark/light mode)
- ~1h: security hardening and Vercel deployment

### Tools and frameworks used

| Category | Tool | Role |
|---|---|---|
| Framework | Next.js 16 (App Router) | SSR, API routes, routing |
| Styling | Tailwind CSS v4 + shadcn/ui v4 | UI components and design system |
| Charts | Recharts | Data visualization |
| Data | YouTube Data API v3 | Channel and video metrics |
| Editor | Cursor | Code editor |
| AI | Claude (Anthropic) via Claude Code CLI | Architecture, algorithms, component scaffolding |
| Methodology | SDD + Engram (Gentleman) | Structured AI-assisted development |
| Deploy | Vercel | Zero-config Next.js deployment |
| Validation | Zod v4 | Runtime input validation on API routes |

### Development methodology: SDD + Engram

This wasn't standard "ask AI, paste code" development. I use a structured workflow called **Spec-Driven Development (SDD)**, a methodology from [Gentleman](https://www.youtube.com/@gentlemanprogramming) that I've adopted as part of my standard setup across all projects.

The full toolset is open source:

- [Engram](https://github.com/Gentleman-Programming/engram): session-persistent memory layer for AI assistants
- [Agent Teams Lite](https://github.com/Gentleman-Programming/agent-teams-lite): the SDD orchestration and agent coordination system
- [Gentle AI](https://github.com/Gentleman-Programming/gentle-ai): the full setup, which includes OpenSpec as the file-based artifact store

Every meaningful feature went through an explicit artifact chain before any code was written:

```
explore → propose → spec → design → tasks → apply → verify → archive
```

Each artifact is persisted via **Engram**, keeping the AI's full context alive across separate work sessions. For file-based traceability, **OpenSpec** (part of Gentle AI) produces versioned spec files alongside the code, so the reasoning behind every decision is documented and reviewable.

**What this enabled in practice:**
- No context drift: every session started from a complete picture, including stack constraints, API strategy, and decisions already made with their reasoning
- No scope creep: specs defined what was in and out before implementation, so the AI executed within clear boundaries
- Human stays in control: I directed what to build and why. The AI implemented the defined tasks. The product thinking was mine.

This is the difference between using AI as sophisticated autocomplete versus using it as a properly scoped collaborator with a memory architecture underneath it.

### What I automated, accelerated, or simplified

**Accelerated with AI:**
- Full TypeScript type system designed in a single planning session
- Algorithm drafts for Z-score trending and composite performance scoring, drafted by AI and verified and refined by me
- Boilerplate structure (API route wrappers, hook patterns, shared utilities)
- Documentation

**Made the key decisions myself:**
- Using the `playlistItems` API over `search.list`, quota savings of ~97% (5-8 units vs 100+ per analysis)
- Z-score approach for trending, channel-relative rather than arbitrary absolute thresholds
- Composite performance score architecture (4 equally weighted dimensions)
- Progressive loading UX, channel header appears while videos are still fetching
- Base64url share encoding with no database dependency
- shadcn/ui v4 on Base UI (not Radix), newer, more composable, better long-term

---

## 2. Product Thinking

### Features I'd add with more time

1. **Multi-channel comparison**: analyze 2-3 channels side by side, overlay engagement curves and compare content strategies directly

2. **Historical tracking**: store analysis snapshots over time to show a channel's trajectory week-over-week (requires Postgres, e.g. Supabase)

3. **Video topic clustering**: use AI to group videos by theme and surface which content pillars perform best for a given channel

4. **Thumbnail analysis**: CV-powered scoring of thumbnail effectiveness (brightness, face presence, text density) correlated with performance

5. **Best time to post**: analyze publish timestamps vs performance across a channel's catalog to surface optimal upload windows

6. **Transcript-based topic analysis**: use YouTube captions to understand what topics dominate top-performing videos

7. **Team workspaces**: shared saved analyses with annotations, so the whole team works from the same competitive intelligence

### What feels missing from the current version

- **Pagination**: currently capped at 50 most recent videos. A real enterprise tool should be able to load a full channel catalog (200+ videos)
- **Charts are not interactive**: clicking a data point should open the video or highlight it in the list. Currently the charts are read-only.
- **No cross-channel context**: all metrics are relative to the channel itself. It would be more valuable to benchmark against industry averages.
- **No saved history**: every analysis is ephemeral. Users can share a link, but can't revisit their own past analyses without re-fetching.

### What I'd improve in version 2

- Replace base64 share links with short URLs backed by a real datastore (Redis or Supabase) to enable analytics on who's sharing what
- Add auth so teams can save, annotate, and revisit past analyses collaboratively
- Make charts fully interactive with click-to-video and hover details
- Pull pagination so large channels (500+ videos) can be fully analyzed, not just the most recent 50
- Proper API response caching layer to avoid re-fetching the same channel twice in a session

---

## 3. Beyond the Brief

These aren't required, but they're the decisions I'm most proud of.

### Quota efficiency architecture

Most YouTube analytics tools naively use `search.list` (100 quota units per call). On YouTube's 10,000-unit daily free tier, that means burning through your budget after just 100 channel analyses.

VidMetrics Pulse uses the **uploads playlist strategy**:

```
channels.list       → 1-3 units   (channel info + uploads playlist ID)
playlistItems.list  → 3 units     (video IDs, paginated)
videos.list         → 1 unit      (full stats for 50 videos per batch)
─────────────────────────────────
Total per analysis: ~5-8 units    (vs 100+ with search)
```

That's **~1,200 analyses per day on the free tier** instead of ~100. For a tool that enterprise teams would run repeatedly throughout a workday, this is the difference between a usable product and one that breaks by noon.

### Z-score trending

Every other "trending" implementation I've seen uses absolute thresholds ("viral = 1M views"). That's useless for benchmarking competitors since a niche channel getting 50K views on a video might be massively outperforming its own baseline.

The Z-score is a standard statistical measure: `Z = (X - μ) / σ`, where X is the value being measured, μ is the population mean, and σ is the standard deviation. A Z-score of 0 means exactly average. A Z-score of +2 means 2 standard deviations above average, which statistically represents roughly the top 2.3% of the distribution.

Applied to video performance:
- **X** is the video's views-per-day (total views divided by days since publish)
- **μ** is the average views-per-day across all videos on that channel
- **σ** is the standard deviation of views-per-day across the same set

This makes the trending signal always relative to that specific channel, not some arbitrary absolute number. A niche channel where 20K views is exceptional gets the same "viral" label as a large channel where 2M views is exceptional.

Videos under 7 days old get a 1.5x recency multiplier since YouTube's algorithm pushes fresh content harder in the first week.

### Security layer (because this is enterprise-facing)

Even at MVP stage, this is going in front of an enterprise client. I added:
- Rate limiting: sliding window (10 req/min channel endpoint, 5 req/min video endpoint)
- Runtime input validation via Zod on all API routes
- Security headers: CSP, HSTS, X-Frame-Options, X-Content-Type-Options
- CSV formula injection prevention
- XSS sanitization on all YouTube-sourced data in PDF export

None of this was in the brief. But an enterprise client can't see a product demo and immediately ask "wait, is this actually secure?" The answer should already be yes.

### Performance score design

The 0-100 composite score has four equally weighted dimensions, each designed to answer a specific strategic question:

| Dimension | Question it answers |
|---|---|
| Views percentile | How does this video rank within this channel's catalog? |
| Engagement rate | Are viewers actually interacting, or just watching? |
| Consistency | Is this performing above or below the channel's typical video? |
| Growth velocity | Is this video still picking up steam, or has it plateaued? |

A video with a high score is genuinely doing well across all dimensions, not just one outlier metric inflating the number.

---

*Built for the VidMetrics Vibe Coder Product Developer challenge.*
