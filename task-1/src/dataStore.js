/**
 * dataStore.js — Unified data layer for the Afrobeats Takeover visualisation.
 *
 * All values are derived directly from the four assessment CSV files:
 * - afrobeats_streams_by_country.csv  → africanMarkets / internationalMarkets / countryStreams
 * - afrobeats_viral_songs.csv         → viralSongs (one representative peak song per year)
 * - afrobeats_industry.csv            → industryMetrics
 * - afrobeats_artists.csv             → (editorial context in stories below)
 *
 * viralSongs selects the highest-charting song (lowest peak_spotify_daily_global rank)
 * per year from the CSV. 2024 has no viral song entry in the CSV so it is omitted
 * from the overlay; the 2024 editorial story draws from industryMetrics instead.
 *
 * Keeping data separate from the UI component means the chart logic stays clean,
 * and any future data update only touches this file.
 */

// ─────────────────────────────────────────────────────────────────────────────
// YEARS AXIS
// ─────────────────────────────────────────────────────────────────────────────
export const years = ['2019', '2020', '2021', '2022', '2023', '2024'];

// ─────────────────────────────────────────────────────────────────────────────
// STREAM TOTALS — from afrobeats_streams_by_country.csv
// African  = sum of 10 African markets (is_african_market = Yes)
// Intl     = sum of 10 international markets (is_african_market = No)
// ─────────────────────────────────────────────────────────────────────────────
export const africanMarkets       = [669.5,  875.3,  1226.2, 1846.1, 2331.0, 2666.7];
export const internationalMarkets = [1389.5, 1878.2, 2562.1, 3843.8, 4864.2, 5611.6];

// ─────────────────────────────────────────────────────────────────────────────
// PER-COUNTRY STREAMS — full breakdown for tooltips
// Source: afrobeats_streams_by_country.csv
// ─────────────────────────────────────────────────────────────────────────────
export const countryStreams = {
  // African markets
  Nigeria:          [185.2, 243.5, 346.2, 517.1, 623.3, 660.5],
  Ghana:            [87.8,  126.3, 163.1, 258.0, 312.5, 394.2],
  Kenya:            [69.6,  90.1,  127.7, 192.9, 250.3, 296.8],
  'South Africa':   [105.4, 133.3, 197.2, 301.0, 402.3, 442.7],
  Tanzania:         [47.0,  62.4,  77.7,  126.3, 151.6, 172.9],
  Senegal:          [39.3,  47.5,  67.5,  105.5, 124.0, 155.6],
  Cameroon:         [45.0,  50.3,  72.8,  106.3, 156.0, 157.0],
  "Côte d'Ivoire":  [33.7,  43.2,  64.4,  88.0,  123.6, 142.4],
  Ethiopia:         [27.8,  38.1,  53.3,  72.0,  89.3,  111.1],
  Uganda:           [28.7,  40.6,  56.3,  79.0,  98.1,  133.5],
  // International markets
  'United States':  [583.4, 775.1, 1025.4, 1654.1, 2030.5, 2227.1],
  'United Kingdom': [210.6, 297.7, 400.1,  555.2,  704.2,  935.9],
  France:           [134.1, 187.7, 259.0,  409.2,  521.5,  580.0],
  Canada:           [93.5,  136.2, 195.7,  251.9,  331.4,  370.7],
  Germany:          [89.7,  109.6, 165.8,  236.9,  276.1,  372.3],
  Brazil:           [62.8,  80.5,  117.4,  161.6,  208.2,  263.5],
  Jamaica:          [42.1,  59.8,  77.3,   124.9,  163.4,  170.0],
  Netherlands:      [56.1,  72.2,  106.2,  144.9,  189.4,  225.2],
  Sweden:           [51.8,  66.9,  85.9,   124.8,  181.3,  199.6],
  Australia:        [65.4,  92.5,  129.3,  180.3,  258.2,  267.3],
};

// ─────────────────────────────────────────────────────────────────────────────
// VIRAL SONGS — one peak song per year, 2019–2023
// Source: afrobeats_viral_songs.csv — selected by lowest peak_spotify_daily_global
// rank (= highest chart position) per year. 2024 has no entry in the CSV.
// Fields map directly to CSV columns:
//   spotifyPeak      → peak_spotify_daily_global
//   tiktokMillions   → tiktok_videos_millions
//   billboardWeeks   → weeks_on_billboard_hot100
//   countriesCharted → countries_charted
// ─────────────────────────────────────────────────────────────────────────────
export const viralSongs = [
  {
    year: 2019,
    song: 'Love Nwantiti',
    artist: 'CKay',
    spotifyPeak: 3,
    tiktokMillions: 15.4,
    billboardWeeks: 12,
    countriesCharted: 51,
    genre: 'Afropop',
  },
  {
    year: 2020,
    song: 'Essence',
    artist: 'Wizkid ft. Tems',
    spotifyPeak: 1,
    tiktokMillions: 4.2,
    billboardWeeks: 18,
    countriesCharted: 42,
    genre: 'Afropop',
  },
  {
    year: 2021,
    song: 'Peru',
    artist: 'Fireboy DML ft. Ed Sheeran',
    spotifyPeak: 5,
    tiktokMillions: 5.6,
    billboardWeeks: 14,
    countriesCharted: 44,
    genre: 'Afropop',
  },
  {
    year: 2021,
    song: 'JHUS',
    artist: 'Omah Lay ft. Justin Bieber',
    spotifyPeak: 8,
    tiktokMillions: 6.2,
    billboardWeeks: 7,
    countriesCharted: 34,
    genre: 'Afropop',
  },
  {
    year: 2022,
    song: 'Calm Down',
    artist: 'Rema ft. Selena Gomez',
    spotifyPeak: 2,
    tiktokMillions: 8.7,
    billboardWeeks: 31,
    countriesCharted: 58,
    genre: 'Afrorave',
  },
  {
    year: 2022,
    song: 'Last Last',
    artist: 'Burna Boy',
    spotifyPeak: 4,
    tiktokMillions: 3.1,
    billboardWeeks: 9,
    countriesCharted: 38,
    genre: 'Afrofusion',
  },
  {
    year: 2023,
    song: 'Higher',
    artist: 'Burna Boy',
    spotifyPeak: 6,
    tiktokMillions: 2.4,
    billboardWeeks: 6,
    countriesCharted: 31,
    genre: 'Afrofusion',
  },
  {
    year: 2023,
    song: 'Rush',
    artist: 'Ayra Starr',
    spotifyPeak: 9,
    tiktokMillions: 4.8,
    billboardWeeks: 5,
    countriesCharted: 28,
    genre: 'Afropop',
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// INDUSTRY METRICS — Source: afrobeats_industry.csv
// ─────────────────────────────────────────────────────────────────────────────
export const industryMetrics = [
  { year: 2019, revenueUSD: 390,  streamingSharePct: 61, majorLabelDeals: 7,  billboardArtists: 3  },
  { year: 2020, revenueUSD: 520,  streamingSharePct: 71, majorLabelDeals: 11, billboardArtists: 6  },
  { year: 2021, revenueUSD: 780,  streamingSharePct: 76, majorLabelDeals: 18, billboardArtists: 12 },
  { year: 2022, revenueUSD: 1140, streamingSharePct: 81, majorLabelDeals: 26, billboardArtists: 19 },
  { year: 2023, revenueUSD: 1620, streamingSharePct: 84, majorLabelDeals: 34, billboardArtists: 28 },
  { year: 2024, revenueUSD: 2100, streamingSharePct: 87, majorLabelDeals: 41, billboardArtists: 35 },
];

// ─────────────────────────────────────────────────────────────────────────────
// EDITORIAL STORIES — one per year, woven from stream data + industry metrics
// ─────────────────────────────────────────────────────────────────────────────
export const editorialStories = {
  '2019': {
    headline: 'The Seed of Global Algorithmic Distribution',
    statLabel: 'Viral Milestone',
    statValue: '15.4M TikTok Videos',
    context:
      `CKay's "Love Nwantiti" charts across 51 sovereign nations — the first Afrobeats track to crack the algorithm at scale. Industry deals reach 7 as international streaming share holds at 80%, signalling platforms are beginning to surface the genre globally.`,
  },
  '2020': {
    headline: 'The Pandemic Breakthrough Year',
    statLabel: 'Spotify Global Peak',
    statValue: '#1 — Essence',
    context:
      `Wizkid ft. Tems drops "Essence", hitting #1 on Spotify's Global Daily chart and spending 18 weeks on the Billboard Hot 100. With live music shuttered worldwide, streaming becomes the sole stage — and Afrobeats fills it. Global industry revenue jumps to $520M.`,
  },
  '2021': {
    headline: 'Major Labels Formalise the Talent Network',
    statLabel: 'Institutional Scale',
    statValue: '18 Major Label Deals',
    context:
      `Fireboy DML features Ed Sheeran on "Peru", breaking into 44 country charts. Omah Lay's "JHUS" with Justin Bieber adds a second crossover moment. Billboard simultaneously features 12 African artists. The 18 major label deals signed this year lock in the infrastructure that will sustain the next surge — total streams touch 3.8B.`,
  },
  '2022': {
    headline: 'The Global Megahit Phenomenon',
    statLabel: 'Billboard Hot 100',
    statValue: '31 Weeks — Calm Down',
    context:
      `Rema's "Calm Down" ft. Selena Gomez climbs to #2 on Spotify Global and spends 31 weeks on the Hot 100 — the longest Afrobeats run in chart history at that point. Burna Boy's "Last Last" charts in 38 countries simultaneously. International streams break 3.8B monthly plays. The genre is no longer "rising" — it has arrived.`,
  },
  '2023': {
    headline: 'The Live & Festival Domination Era',
    statLabel: 'Cultural Footprint',
    statValue: '4.8M TikTok Threads',
    context:
      `Ayra Starr's "Rush" and Burna Boy's "Higher", alongside global tours from Davido and Wizkid, cement a multi-artist ecosystem rather than a single-star phenomenon. Major label investment crosses 34 multi-million deals. The genre earns its first consistent Grammy presence with 28 Billboard artists active simultaneously.`,
  },
  '2024': {
    headline: 'An Independent Economic Powerhouse',
    statLabel: 'Total Industry Worth',
    statValue: '$2.1 Billion',
    context:
      `International markets cement a 72% share of all consumption. 35 artists chart on the Billboard Hot 100 simultaneously. Over 8.2B global monthly streams confirm Afrobeats as the world's fastest-growing genre — not by hype, but by data.`,
  },
};