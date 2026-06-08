<script>
  /**
   * App.svelte — Root component for the Afrobeats Takeover visualisation.
   *
   * Architecture:
   * Svelte owns STATE (active year, filter, selected song, tooltip).
   * D3 owns DRAWING (scales, axes, paths, markers).
   *
   * Key fix notes:
   * - Crosshair rect is appended FIRST (lowest z-order) with pointer-events: none.
   *   Mousemove is handled on the SVG element itself instead, so markers on top
   *   receive their own click/hover events unobstructed.
   * - X domain extended to 2024.3 so the 2024 dot isn't clipped at the boundary.
   * - 2024 gets a special industry milestone marker (no viral song in CSV for 2024).
   * - Viral song markers are grouped in a dedicated layer appended after the lines
   *   but their pointer-events work because the crosshair no longer covers them.
   */

  import { onMount } from 'svelte';
  import * as d3 from 'd3';
  import {
    years,
    africanMarkets,
    internationalMarkets,
    viralSongs,
    editorialStories,
    industryMetrics,
  } from './dataStore.js';

  let selectedFilter = 'all';
  let activeYear     = '2024';
  let activeSong     = null;
  let tooltip        = { visible: false, x: 0, y: 0, year: '', value: '', label: '' };

  $: currentStory = editorialStories[activeYear];

  let svgContainer;
  let resizeTimer;

  function drawChart() {
    if (!svgContainer) return;
    d3.select(svgContainer).selectAll('*').remove();

    // ── Dimensions ──────────────────────────────────────────────────────────
    const margin = { top: 48, right: 32, bottom: 44, left: 62 };
    const totalW  = svgContainer.clientWidth;
    const totalH  = Math.min(420, Math.max(300, window.innerHeight * 0.44));
    const W       = totalW  - margin.left - margin.right;
    const H       = totalH  - margin.top  - margin.bottom;

    const svg = d3.select(svgContainer)
      .append('svg')
        .attr('width',  totalW)
        .attr('height', totalH)
        .attr('aria-label', 'Line chart: Afrobeats monthly streams 2019–2024');

    // Inject pulse animation into SVG defs — only way to reach SVG DOM reliably
    const defs = svg.append('defs');
    defs.append('style').text(`
      @keyframes afro-pulse {
        0%   { r: 8;  opacity: 0.55; }
        70%  { r: 20; opacity: 0;    }
        100% { r: 8;  opacity: 0;    }
      }
      .pulse-ring { animation: afro-pulse 2.6s ease-out infinite; }
    `);

    // Clip path — extend width by 20px so rightmost dot is never half-clipped
    defs.append('clipPath').attr('id', 'chart-clip')
      .append('rect').attr('width', W + 20).attr('height', H + 10).attr('x', -10);

    const g = svg.append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    // ── Data ────────────────────────────────────────────────────────────────
    const data = years.map((yr, i) => ({
      year:    +yr,
      african: africanMarkets[i],
      intl:    internationalMarkets[i],
    }));

    // ── Scales ──────────────────────────────────────────────────────────────
    // Domain ends at 2024.2 to give the last dot breathing room from the edge
    const xScale = d3.scaleLinear()
      .domain([2019, 2024.2])
      .range([0, W]);

    const yMax = d3.max(data, d => d.intl) * 1.08;
    const yScale = d3.scaleLinear()
      .domain([0, yMax])
      .range([H, 0]);

    // ── Grid lines ──────────────────────────────────────────────────────────
    g.append('g')
      .call(d3.axisLeft(yScale).ticks(5).tickSize(-W).tickFormat(''))
      .call(gr => gr.select('.domain').remove())
      .call(gr => gr.selectAll('line')
        .attr('stroke', 'rgba(255,255,255,0.05)')
        .attr('stroke-dasharray', '3,4'));

    // ── CROSSHAIR RECT — appended first = lowest z-order = never blocks markers ──
    // pointer-events: none means it never intercepts clicks at all.
    // Mousemove tracking is done on the svg element below instead.
    const crosshairRect = g.append('rect')
      .attr('class', 'crosshair-bg')
      .attr('width', W)
      .attr('height', H)
      .attr('fill', 'transparent')
      .style('pointer-events', 'none');

    // Cursor line element — toggled by svg mousemove
    const cursorLine = g.append('line')
      .attr('class', 'cursor-line')
      .attr('y1', 0).attr('y2', H)
      .attr('stroke', 'rgba(255,255,255,0.12)')
      .attr('stroke-width', 1)
      .attr('stroke-dasharray', '3,3')
      .attr('pointer-events', 'none')
      .attr('opacity', 0);

    // Mousemove on the SVG itself — works regardless of what's on top
    svg.style('cursor', 'crosshair')
      .on('mousemove', function(event) {
        const [mx] = d3.pointer(event, g.node());
        if (mx < 0 || mx > W) { cursorLine.attr('opacity', 0); return; }
        const hoverYear = xScale.invert(mx);
        const nearest = data.reduce((a, b) =>
          Math.abs(b.year - hoverYear) < Math.abs(a.year - hoverYear) ? b : a);
        cursorLine
          .attr('x1', xScale(nearest.year))
          .attr('x2', xScale(nearest.year))
          .attr('opacity', 1);
      })
      .on('mouseleave', function() {
        cursorLine.attr('opacity', 0);
        hideTooltip();
      });

    // ── Curve generators ────────────────────────────────────────────────────
    const makeArea = yAcc => d3.area()
      .x(d => xScale(d.year)).y0(H).y1(d => yAcc(d))
      .curve(d3.curveCatmullRom.alpha(0.5));

    const makeLine = yAcc => d3.line()
      .x(d => xScale(d.year)).y(d => yAcc(d))
      .curve(d3.curveCatmullRom.alpha(0.5));

    const chartBody = g.append('g').attr('clip-path', 'url(#chart-clip)');

    // ── African series ───────────────────────────────────────────────────────
    if (selectedFilter === 'all' || selectedFilter === 'african') {
      chartBody.append('path').datum(data)
        .attr('fill', 'rgba(62,207,122,0.07)')
        .attr('d', makeArea(d => yScale(d.african)));

      chartBody.append('path').datum(data)
        .attr('fill', 'none').attr('stroke', '#3ECF7A').attr('stroke-width', 2.5)
        .attr('d', makeLine(d => yScale(d.african)));

      g.selectAll('.dot-african').data(data).join('circle')
        .attr('class', 'dot-african')
        .attr('cx', d => xScale(d.year)).attr('cy', d => yScale(d.african))
        .attr('r', 5).attr('fill', '#3ECF7A')
        .attr('stroke', '#0F1B14').attr('stroke-width', 2)
        .style('cursor', 'pointer')
        .on('click', (event, d) => { activeYear = String(d.year); })
        .on('mousemove', (event, d) => {
          showTooltip(event, String(d.year), `${d.african.toLocaleString()}M`, 'African markets');
        })
        .on('mouseleave', hideTooltip);
    }

    // ── International series ─────────────────────────────────────────────────
    if (selectedFilter === 'all' || selectedFilter === 'international') {
      chartBody.append('path').datum(data)
        .attr('fill', 'rgba(212,160,23,0.05)')
        .attr('d', makeArea(d => yScale(d.intl)));

      chartBody.append('path').datum(data)
        .attr('fill', 'none').attr('stroke', '#D4A017').attr('stroke-width', 2.5)
        .attr('d', makeLine(d => yScale(d.intl)));

      // Regular intl dots — rendered AFTER lines so they're above them
      g.selectAll('.dot-intl').data(data).join('circle')
        .attr('class', 'dot-intl')
        .attr('cx', d => xScale(d.year)).attr('cy', d => yScale(d.intl))
        .attr('r', 5).attr('fill', '#D4A017')
        .attr('stroke', '#0F1B14').attr('stroke-width', 2)
        .style('cursor', 'pointer')
        .on('click', (event, d) => { activeYear = String(d.year); })
        .on('mousemove', (event, d) => {
          showTooltip(event, String(d.year), `${d.intl.toLocaleString()}M`, 'International markets');
        })
        .on('mouseleave', hideTooltip);

      // ── VIRAL SONG MARKERS ─────────────────────────────────────────────────
      // One marker per song from viralSongs (2019–2023).
      // 2024 gets a special industry milestone marker drawn separately below.
      // Markers are drawn LAST so they sit above all lines and dots in z-order.
      const songsByYear = d3.group(viralSongs, s => s.year);

      songsByYear.forEach((songs, year) => {
        const pt = data.find(d => d.year === year);
        if (!pt) return;

        const baseCx = xScale(year);
        const baseCy = yScale(pt.intl);
        const sorted = [...songs].sort((a, b) => a.spotifyPeak - b.spotifyPeak);

        sorted.forEach((song, idx) => {
          const cx = baseCx;
          const cy = baseCy - idx * 30;  // stack upward for multi-song years

          // Pulse ring
          g.append('circle').attr('class', 'pulse-ring')
            .attr('cx', cx).attr('cy', cy).attr('r', 8)
            .attr('fill', 'none').attr('stroke', '#D4A017')
            .attr('stroke-width', 1.4).attr('opacity', 0.5);

          // Gold clickable marker
          g.append('circle').attr('class', 'song-marker')
            .attr('cx', cx).attr('cy', cy).attr('r', 7)
            .attr('fill', '#D4A017').attr('stroke', '#0F1B14').attr('stroke-width', 2.5)
            .style('cursor', 'pointer')
            .on('click', function(event) {
              event.stopPropagation();
              activeSong = song;
              activeYear = String(year);
            })
            .on('mousemove', function(event) {
              showTooltip(event, String(year), `${pt.intl.toLocaleString()}M`,
                `♪ ${song.song} — click to explore`);
            })
            .on('mouseleave', hideTooltip);

          // Song title label
          g.append('text')
            .attr('x', cx).attr('y', cy - 13)
            .attr('text-anchor', 'middle')
            .attr('font-size', '9px').attr('font-weight', '600')
            .attr('fill', '#D4A017').attr('opacity', 0.9)
            .attr('pointer-events', 'none')
            .text(song.song);
        });
      });

      // ── 2024 INDUSTRY MILESTONE MARKER ──────────────────────────────────────
      // The viral songs CSV has no 2024 entry. Instead we mark the $2.1B revenue
      // milestone from industryMetrics — an equally significant data moment.
      const pt2024 = data.find(d => d.year === 2024);
      if (pt2024) {
        const cx24 = xScale(2024);
        const cy24 = yScale(pt2024.intl);

        g.append('circle').attr('class', 'pulse-ring')
          .attr('cx', cx24).attr('cy', cy24).attr('r', 8)
          .attr('fill', 'none').attr('stroke', '#3ECF7A')
          .attr('stroke-width', 1.4).attr('opacity', 0.5);

        // Emerald-coloured to distinguish it as an industry milestone, not a song
        g.append('circle').attr('class', 'milestone-marker-2024')
          .attr('cx', cx24).attr('cy', cy24).attr('r', 7)
          .attr('fill', '#3ECF7A').attr('stroke', '#0F1B14').attr('stroke-width', 2.5)
          .style('cursor', 'pointer')
          .on('click', function(event) {
            event.stopPropagation();
            activeSong = {
              year: 2024,
              song: '$2.1B Industry Revenue',
              artist: 'Afrobeats Global Economy',
              spotifyPeak: null,
              tiktokMillions: null,
              billboardWeeks: 35,
              countriesCharted: null,
              genre: 'Industry Milestone',
              isMilestone: true,
            };
            activeYear = '2024';
          })
          .on('mousemove', function(event) {
            showTooltip(event, '2024', `${pt2024.intl.toLocaleString()}M`,
              '★ $2.1B milestone — click to explore');
          })
          .on('mouseleave', hideTooltip);

        g.append('text')
          .attr('x', cx24).attr('y', cy24 - 13)
          .attr('text-anchor', 'middle')
          .attr('font-size', '9px').attr('font-weight', '600')
          .attr('fill', '#3ECF7A').attr('opacity', 0.9)
          .attr('pointer-events', 'none')
          .text('$2.1B');
      }
    }

    // ── Axes ────────────────────────────────────────────────────────────────
    g.append('g').attr('transform', `translate(0,${H})`)
      .call(d3.axisBottom(xScale)
        .tickValues([2019, 2020, 2021, 2022, 2023, 2024])
        .tickFormat(d3.format('d')).tickSize(0))
      .call(gr => gr.select('.domain').attr('stroke', 'rgba(255,255,255,0.08)'))
      .call(gr => gr.selectAll('text')
        .attr('fill', '#7A9384').attr('font-size', '12px').attr('dy', '1.5em'));

    g.append('g')
      .call(d3.axisLeft(yScale).ticks(5)
        .tickFormat(d => d >= 1000 ? `${d / 1000}B` : `${d}M`).tickSize(0))
      .call(gr => gr.select('.domain').remove())
      .call(gr => gr.selectAll('text')
        .attr('fill', '#7A9384').attr('font-size', '11px').attr('dx', '-0.4em'));

    g.append('text')
      .attr('transform', 'rotate(-90)')
      .attr('y', -margin.left + 6).attr('x', -(H / 2))
      .attr('text-anchor', 'middle')
      .attr('fill', '#7A9384').attr('font-size', '11px')
      .text('Monthly streams');
  }

  function setFilter(value) {
    selectedFilter = value;
    drawChart();
  }

  function showTooltip(event, year, value, label) {
    tooltip = {
      visible: true,
      x: event.clientX + 14,
      y: event.clientY - 10,
      year,
      value: `${value} streams/mo`,
      label,
    };
  }

  function hideTooltip() {
    tooltip = { ...tooltip, visible: false };
  }

  onMount(() => {
    drawChart();
    const handleResize = () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(drawChart, 120);
    };
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
      clearTimeout(resizeTimer);
    };
  });
</script>

<main class="dashboard-root">

  <header class="app-header">
    <div class="eyebrow">Data Story · Afrobeats Global Rise · 2019–2024</div>
    <h1>The Afrobeats Takeover</h1>
    <p class="headline-takeaway">
      International streams grew 4× in five years — a genre born in Lagos
      now drives more plays outside Africa than within it.
    </p>
    <p class="summary-text">
      Monthly streaming volumes across 20 countries, 2019–2024.
      Click any data point to reveal the year's story.
      Click a <span class="gold-span">gold ●</span> marker to explore the viral song behind each surge.
      The <span class="green-span">green ●</span> at 2024 marks the $2.1B industry milestone.
    </p>
  </header>

  <div class="interface-grid">

    <div class="chart-section">
      <div class="filter-row">
        <button class:active={selectedFilter === 'all'} on:click={() => setFilter('all')}>
          Combined
        </button>
        <button class:active={selectedFilter === 'african'} on:click={() => setFilter('african')}>
          African Only
        </button>
        <button class:active={selectedFilter === 'international'} on:click={() => setFilter('international')}>
          International Only
        </button>
      </div>

      <div class="canvas-holder" bind:this={svgContainer}></div>

      <div class="legend-row">
        <span class="legend-item">
          <span class="legend-line emerald-line"></span>
          African markets
        </span>
        <span class="legend-item">
          <span class="legend-line gold-line"></span>
          International markets
        </span>
        <span class="legend-item">
          <span class="legend-dot gold-dot"></span>
          Viral song milestone
        </span>
        <span class="legend-item">
          <span class="legend-dot green-dot"></span>
          Industry milestone
        </span>
      </div>
      <p class="chart-hint">Hover for values · Click any point or marker for the full story</p>
    </div>

    <div class="story-panel">

      {#if activeSong}
        <div class="song-detail" role="region" aria-label="Milestone details">
          <div class="song-detail-header">
            <span class="song-tag">
              {activeSong.isMilestone ? 'Industry Milestone' : 'Viral Milestone'} · {activeSong.year}
            </span>
            <button class="close-btn" on:click={() => activeSong = null} aria-label="Close">✕</button>
          </div>
          <p class="song-title">{activeSong.song}</p>
          <p class="song-artist">{activeSong.artist}</p>

          {#if activeSong.isMilestone}
            <div class="song-stats">
              <div class="stat-chip">
                <span class="stat-val">$2.1B</span>
                <span class="stat-lbl">Global Revenue</span>
              </div>
              <div class="stat-chip">
                <span class="stat-val">87%</span>
                <span class="stat-lbl">Streaming Share</span>
              </div>
              <div class="stat-chip">
                <span class="stat-val">41</span>
                <span class="stat-lbl">Major Label Deals</span>
              </div>
              <div class="stat-chip">
                <span class="stat-val">35</span>
                <span class="stat-lbl">Billboard Artists</span>
              </div>
            </div>
          {:else}
            <div class="song-stats">
              <div class="stat-chip">
                <span class="stat-val">#{activeSong.spotifyPeak}</span>
                <span class="stat-lbl">Spotify Global Peak</span>
              </div>
              <div class="stat-chip">
                <span class="stat-val">{activeSong.tiktokMillions}M</span>
                <span class="stat-lbl">TikTok Videos</span>
              </div>
              <div class="stat-chip">
                <span class="stat-val">
                  {activeSong.billboardWeeks > 0 ? activeSong.billboardWeeks + ' wks' : '—'}
                </span>
                <span class="stat-lbl">Billboard Hot 100</span>
              </div>
              <div class="stat-chip">
                <span class="stat-val">{activeSong.countriesCharted}</span>
                <span class="stat-lbl">Countries Charted</span>
              </div>
            </div>
          {/if}
        </div>
        <hr class="panel-divider" />
      {/if}

      {#if currentStory}
        <div class="panel-header">
          <span class="year-badge">{activeYear}</span>
          <h3>{currentStory.headline}</h3>
        </div>
        <div class="metric-card">
          <span class="lbl">{currentStory.statLabel}</span>
          <span class="val">{currentStory.statValue}</span>
        </div>
        <p class="narrative-body">{currentStory.context}</p>
      {/if}

    </div>
  </div>

</main>

{#if tooltip.visible}
  <div class="tooltip" style="left:{tooltip.x}px; top:{tooltip.y}px;" role="tooltip">
    <span class="tt-year">{tooltip.year}</span>
    <span class="tt-value">{tooltip.value}</span>
    <span class="tt-label">{tooltip.label}</span>
  </div>
{/if}

<style>
  :global(body) {
    background-color: #0F1B14;
    margin: 0; padding: 0;
    font-family: system-ui, -apple-system, sans-serif;
    -webkit-font-smoothing: antialiased;
  }

  .dashboard-root {
    background: radial-gradient(circle at top left, #14281b 0%, #0F1B14 100%);
    color: #F5F5F5;
    padding: 2.5rem;
    max-width: 1140px;
    margin: 2rem auto;
    border-radius: 16px;
    border: 1px solid rgba(255,255,255,0.03);
  }

  .eyebrow {
    color: #3ECF7A; font-size: 0.68rem; font-weight: 800;
    letter-spacing: 0.28em; text-transform: uppercase; margin-bottom: 0.6rem;
  }
  h1 {
    font-family: Georgia, serif;
    font-size: clamp(1.6rem, 4vw, 2.6rem);
    font-weight: 800; margin: 0 0 0.5rem; line-height: 1.15;
  }
  .headline-takeaway {
    font-size: 1.05rem; color: #D4A017; font-style: italic;
    margin-bottom: 0.5rem; line-height: 1.5; max-width: 700px;
  }
  .summary-text {
    color: #7A9384; max-width: 700px; line-height: 1.6;
    margin-bottom: 2rem; font-size: 0.9rem;
  }
  .gold-span  { color: #D4A017; }
  .green-span { color: #3ECF7A; }

  .interface-grid {
    display: grid;
    grid-template-columns: 1fr 330px;
    gap: 1.8rem;
  }
  @media (max-width: 900px) {
    .interface-grid { grid-template-columns: 1fr; }
    .dashboard-root { padding: 1.5rem; margin: 1rem; }
  }

  .chart-section {
    background: rgba(26,46,31,0.4);
    backdrop-filter: blur(12px);
    border: 1px solid rgba(255,255,255,0.05);
    padding: 1.5rem; border-radius: 12px; min-width: 0;
  }

  .filter-row { display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 1.2rem; }
  button {
    background: #1A2E1F; border: 1px solid rgba(62,207,122,0.1);
    color: #7A9384; padding: 0.45rem 1rem; border-radius: 6px;
    cursor: pointer; font-weight: 600; font-size: 0.82rem; transition: all 0.2s ease;
  }
  button:hover { background: #2E5A36; color: #fff; }
  button.active { background: #D4A017; color: #0F1B14; border-color: #D4A017; }
  button:focus-visible { outline: 2px solid #D4A017; outline-offset: 2px; }

  .canvas-holder { width: 100%; min-height: 300px; }

  .legend-row { display: flex; flex-wrap: wrap; gap: 1rem; margin-top: 0.8rem; padding-left: 2px; }
  .legend-item { display: flex; align-items: center; gap: 0.45rem; font-size: 0.78rem; color: #7A9384; }
  .legend-line  { width: 18px; height: 2px; border-radius: 2px; }
  .emerald-line { background: #3ECF7A; }
  .gold-line    { background: #D4A017; }
  .legend-dot   { width: 9px; height: 9px; border-radius: 50%; }
  .gold-dot     { background: #D4A017; border: 2px solid #0F1B14; }
  .green-dot    { background: #3ECF7A; border: 2px solid #0F1B14; }

  .chart-hint { font-size: 0.75rem; color: #4A6255; margin-top: 0.5rem; padding-left: 2px; }

  .story-panel {
    background: rgba(26,46,31,0.6); backdrop-filter: blur(16px);
    border: 1px solid rgba(255,255,255,0.06);
    padding: 1.8rem 1.4rem; border-radius: 12px;
    display: flex; flex-direction: column; gap: 0;
  }

  .song-detail { margin-bottom: 0.5rem; }
  .song-detail-header {
    display: flex; align-items: center;
    justify-content: space-between; margin-bottom: 0.5rem;
  }
  .song-tag {
    font-size: 0.68rem; letter-spacing: 0.18em;
    text-transform: uppercase; color: #D4A017; font-weight: 700;
  }
  .close-btn {
    all: unset; color: #7A9384; font-size: 1rem;
    cursor: pointer; line-height: 1; padding: 4px 6px;
    border-radius: 4px; transition: color 0.15s ease;
  }
  .close-btn:hover { color: #F0F4F1; }

  .song-title  { font-family: Georgia,serif; font-size: 1.2rem; font-weight: 700; color: #fff; margin: 0 0 0.15rem; }
  .song-artist { font-size: 0.85rem; color: #7A9384; margin: 0 0 0.9rem; }
  .song-stats  { display: grid; grid-template-columns: 1fr 1fr; gap: 0.6rem; }
  .stat-chip   { background: rgba(255,255,255,0.04); border-radius: 6px; padding: 0.5rem 0.7rem; }
  .stat-val    { display: block; font-size: 1rem; font-weight: 700; color: #D4A017; }
  .stat-lbl    { display: block; font-size: 0.72rem; color: #7A9384; margin-top: 0.1rem; }

  .panel-divider { border: none; border-top: 1px solid rgba(255,255,255,0.07); margin: 1rem 0; }

  .panel-header { margin-bottom: 0.9rem; }
  .year-badge {
    background: #D4A017; color: #0F1B14; font-weight: 900;
    padding: 0.18rem 0.55rem; border-radius: 4px; font-size: 0.82rem;
    display: inline-block; margin-bottom: 0.6rem;
  }
  h3 { font-family: Georgia,serif; font-size: 1.25rem; margin: 0; color: #fff; line-height: 1.3; }

  .metric-card {
    background: rgba(15,27,20,0.8); border: 1px solid rgba(62,207,122,0.18);
    padding: 0.9rem 1rem; border-radius: 8px; margin-bottom: 1rem;
  }
  .metric-card .lbl {
    font-size: 0.68rem; text-transform: uppercase; color: #3ECF7A;
    display: block; letter-spacing: 0.1em; margin-bottom: 0.2rem;
  }
  .metric-card .val { font-size: 1.5rem; font-weight: 800; color: #fff; display: block; }

  .narrative-body { color: #C8D8CC; line-height: 1.65; font-size: 0.9rem; margin: 0; }

  .tooltip {
    position: fixed; pointer-events: none;
    background: #1A2E1F; border: 1px solid rgba(255,255,255,0.08);
    border-radius: 9px; padding: 0.7rem 0.95rem;
    z-index: 9999; box-shadow: 0 8px 24px rgba(0,0,0,0.5);
    display: flex; flex-direction: column; gap: 0.15rem; max-width: 220px;
  }
  .tt-year  { font-size: 0.7rem; color: #7A9384; }
  .tt-value { font-size: 1rem; font-weight: 700; color: #fff; }
  .tt-label { font-size: 0.78rem; color: #7A9384; }
</style>