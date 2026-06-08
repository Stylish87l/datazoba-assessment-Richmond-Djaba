# DataZoba Frontend Engineering Fellowship — Technical Assessment

**Candidate:** Richmond Twumasi Djaba

**Repository:** `datazoba-assessment-Richmond-Djaba`

**Submitted:** 8/06/26

---

## Repository Structure

```
datazoba-assessment-Richmond Djaba/
│
├── README.md               ← You are here
├── task-1/                 ← Data Visualisation (Svelte + D3.js)
│   ├── index.html
│   ├── package.json
│   ├── vite.config.js
│   └── src/
│       ├── main.js
│       ├── App.svelte
│       └── dataStore.js
├── task-2/                 ← Layout & Craft (plain HTML/CSS)
│   └── index.html
└── task-3/                 ← Editorial Thinking (Markdown pitch)
    └── PITCH.md
```

---

## Before You Read Further

The assessment says: *"Read this entire document before starting."* I did. Every decision below — why I chose D3 over Chart.js, why the tag sits above the title in Task 2, why the chord diagram is right for Task 3 — came from reading the brief first and letting the requirements drive the choices.

---

## Task 1 — Data Visualisation: The Afrobeats Takeover

### What I Built

An interactive visualisation in **Svelte + D3.js** showing how Afrobeats grew from a regional genre to a global phenomenon between 2019 and 2024. Two area-line curves plot monthly streaming volumes across 20 countries (10 African, 10 international). Five viral song milestones sit as clickable markers on the international curve, connecting each cultural breakthrough to the streaming surge it triggered.

### How to Run

**Requirements:** Node.js 18+, npm.

```bash
cd task-1
npm install
npm run dev
```

Open `http://localhost:5173`. No backend, no API keys. To build for production: `npm run build` → output in `task-1/dist/`.

### The Data

| File | How I used it |
|---|---|
| `afrobeats_streams_by_country.csv` | Summed `monthly_streams_millions` per year, split by `is_african_market`, to produce two trend lines |
| `afrobeats_viral_songs.csv` | Selected 5 songs with `peak_spotify_daily_global ≤ 9` and `tiktok_videos_millions ≥ 4` for overlay markers |

All data is inlined in `src/dataStore.js` rather than fetched at runtime — the app works immediately on `npm run dev` without needing CSV files served separately.

### Key Decisions

**Why Svelte + D3?** DataZoba's stated stack. Svelte handles reactive state (active year, selected filter, open song panel) cleanly without manual DOM updates; D3 owns the SVG drawing. Each tool does what it does best.

**Why D3 over Chart.js?** The stretch goal required placing viral song annotations at precise coordinates on the curve with pulsing ring animations. D3 gives full control over geometry and interaction; Chart.js's annotation plugin would have required fighting the library to achieve the same result.

**Why the area fill?** The gap between Africa's 2,667M and international's 5,612M monthly streams in 2024 is itself a data point. The area fill makes that magnitude visible at a glance — a line-only chart communicates the trend; the fill communicates the scale difference.

**Why `curveCatmullRom`?** Linear curves suggest mechanical, steady growth. Catmull-Rom reflects what happened: organic acceleration around cultural moments. The `alpha(0.5)` centripetal variant avoids the overshoot artifacts of `alpha(0)` on datasets with uneven point spacing.

**Why song markers on the international curve only?** The story is about international breakthrough. "Essence", "Calm Down", "Love Nwantiti" matter because they crossed *out of* African markets into global consciousness. Placing markers on the African curve would be technically defensible but narratively wrong.

**The stretch goal** is fully implemented. Each of the five milestone songs sits at its release year on the international curve with a pulsing ring and a clickable detail panel showing Spotify peak, TikTok video count, Billboard weeks, and countries charted — all from `afrobeats_viral_songs.csv`.

---

## Task 2 — Layout & Craft: The Story Card

### What I Built

A single HTML/CSS file — no JavaScript, no frameworks — implementing the DataZoba story card to spec. Responsive from 320px to 1400px+, CSS custom properties throughout, and five deliberate improvements beyond the brief.

### How to Run

No build step. Open `task-2/index.html` directly in any modern browser.

### Spec Compliance

| Spec requirement | Implementation |
|---|---|
| Dark background `#0F1B14` | `body { background-color: var(--bg) }` |
| Card background `#1A2E1F` | `--card-bg: #1A2E1F` |
| Title: serif, large, bold | Georgia, `clamp(1.85rem, 5vw, 2.4rem)`, weight 700 |
| Stat: '$2.1B', gold `#D4A017` | `clamp(3.5rem, 12vw, 4.5rem)`, `color: var(--gold)` |
| Tag: small caps, green border | `font-variant: small-caps` + `text-transform: uppercase` fallback, `border: 1px solid #3ECF7A` |
| Thin gold underline | `<hr>` with `background: linear-gradient(90deg, var(--gold), transparent)` |
| Description: exact wording | Verbatim |
| 'Read the story' link | `<a class="cta-link">` |
| Responsive | `clamp()` on all font sizes and padding, `max-width: 480px`, `width: 100%` |

### Key Decisions

**Why max-width 480px?** Wide enough to read as a desktop story card — not just a mobile component — while fitting comfortably within a DataZoba article column.

**On the "neutral background":** I interpreted this as contextually neutral — the card's own spec background (#0F1B14) so its visual intent is fully legible, rather than white (which inverts the dark palette and misrepresents the design). A subtle radial gradient echoes DataZoba's identity without competing with the card.

**Why `font-variant: small-caps` and `text-transform: uppercase` together?** Small-caps rendering varies across browsers and Android system fonts — it sometimes falls back to full-size caps, making the tag feel oversized. `text-transform: uppercase` with `font-size: 0.72rem` ensures the visual intent is always honoured regardless of rendering environment.

**Why the tag above the title?** Editorial convention: category → headline → data → body → action. The spec lists elements without mandating order; placing the tag above the title follows the pattern DataZoba uses on its own published stories.

**Why `-0.04em` letter-spacing on the stat?** At display sizes (3.5–4.5rem), default tracking makes `$2.1B` read as three loose characters. Tightening to -0.04em makes the figure read as a single unit — standard typographic practice for display numerals.

**The reading progress bar:** On hover, a 2px gradient bar fills left-to-right across the card's top edge — a reading-progress metaphor that communicates "this card leads somewhere" before the click. No JavaScript: the bar is `.card::after`, triggered by `.card:hover::after`. Hidden on touch devices (`@media (hover: none)`) to prevent sticky hover states on iOS.

**Layout compensation on hover:** `transform: translateY(-8px)` is paired with `margin-bottom: -8px` sharing the same transition timing — the lift feels clean without displacing surrounding content.

**CSS organisation:** All 9 colour values are custom properties in `:root`. Spacing uses an 8px base grid (`--space-1` through `--space-5`). Every non-obvious decision has a comment. No `!important`, no selector deeper than two levels.

---

## Task 3 — Editorial Thinking: The Story Pitch

### What I Built

A markdown pitch for a data story about how African football federations construct their 2026 World Cup squads from diaspora players born across Europe — and what that tells us about post-colonial migration, national identity, and what belonging means.

The deliverable is `task-3/PITCH.md`.

### Why This Story

I looked for a story with a genuine tension inside the data — not just a pattern but a contradiction. DRC (20 foreign-born players) and Morocco (19) against South Africa's 100% domestically-built squad is that contradiction. Both strategies exist in the same tournament, in the same spreadsheet, and they represent fundamentally different answers to the same question: what is a national team for?

### Why the Chord Diagram

The story is about flow between specific places — Brussels to Kinshasa, Paris to Rabat, Amsterdam to Lagos. A bar chart tells you *how many* foreign-born players each squad has. A chord diagram tells you *where they came from* and which corridors are heaviest. The visual form matches the story's actual question. The linked unit grid (one square per player) then does what data journalism does best: moves from aggregate to individual. The chord diagram earns attention. The unit grid earns feeling.

---

## Data Quality Notes

Two observations — noting data issues is itself a valuable skill:

1. **`afrobeats_streams_by_country.csv`** — Exactly 10 African and 10 international countries per year, no missing values. This is unusually clean and likely reflects curation rather than raw export. In production I would want to understand whether the country selection is a fixed panel or reflects availability — the answer affects how growth should be qualified.

2. **`afrobeats_viral_songs.csv`** — "Ye" by Burna Boy has `year: 2018`, outside the 2019–2024 streaming window. I excluded it from the overlay. Placing a 2018 marker on a 2019-anchored x-axis would have been visually misleading.

---

## Stack Summary

| Task | Technology | Why |
|---|---|---|
| Task 1 | Svelte 4 + D3.js v7 + Vite | DataZoba's own stack; D3 needed for precise viral song overlay geometry |
| Task 2 | Plain HTML5 + CSS3 | Brief mandates no frameworks, no JavaScript |
| Task 3 | Markdown | Brief mandates a `.md` file |

---

*DataZoba Technical Assessment — Submitted by Richmond Twumasi Djaba*
*Contact: [richmond.djaba.dev@gmail.com]*
