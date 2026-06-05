<script>
  import { onMount } from 'svelte';
  import Chart from 'chart.js/auto';
  import { afrobeatsDataEngine } from './dataStore.js';

  let chartCanvas;
  let chartInstance = null;
  let selectedFilter = 'all';
  let activeYear = '2024';

  // Safely abstracts data so the HTML template doesn't have to do heavy lifting
  $: currentStory = afrobeatsDataEngine.editorialStories[activeYear];

  function initChart() {
    // Failsafe checks
    if (!chartCanvas) {
        return;
    }
    if (chartInstance) {
        chartInstance.destroy();
    }

    const activeDatasets = [];

    if (selectedFilter === 'all' || selectedFilter === 'african') {
      activeDatasets.push({
        label: 'African Regional Markets (Millions/Mo)',
        data: afrobeatsDataEngine.africanMarkets,
        borderColor: '#4CDF8A',
        backgroundColor: 'rgba(76, 223, 138, 0.03)',
        fill: true,
        tension: 0.4,
        borderWidth: 3,
        pointRadius: 6,
        pointHoverRadius: 9,
        pointBackgroundColor: '#4CDF8A',
        pointBorderColor: '#0F1B14'
      });
    }

    if (selectedFilter === 'all' || selectedFilter === 'international') {
      activeDatasets.push({
        label: 'International Target Markets (Millions/Mo)',
        data: afrobeatsDataEngine.internationalMarkets,
        borderColor: '#D4A017',
        backgroundColor: 'rgba(212, 160, 23, 0.03)',
        fill: true,
        tension: 0.4,
        borderWidth: 3,
        pointRadius: 6,
        pointHoverRadius: 9,
        pointBackgroundColor: '#D4A017',
        pointBorderColor: '#0F1B14'
      });
    }

    chartInstance = new Chart(chartCanvas, {
      type: 'line',
      data: {
        labels: afrobeatsDataEngine.years,
        datasets: activeDatasets
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        // Standard function prevents JSX parser confusion
        onClick: function(event, elements) {
          if (elements && elements.length) {
            const dataIndex = elements[0].index;
            activeYear = afrobeatsDataEngine.years[dataIndex];
          }
        },
        plugins: {
          legend: {
            position: 'top',
            labels: { color: '#E2E8F0', font: { family: 'system-ui', size: 12, weight: '600' } }
          },
          tooltip: {
            backgroundColor: '#1A2E1F',
            titleColor: '#D4A017',
            bodyColor: '#F5F5F5',
            padding: 12,
            borderWidth: 1,
            borderColor: 'rgba(255,255,255,0.08)'
          }
        },
        scales: {
          y: { grid: { color: 'rgba(255, 255, 255, 0.04)' }, ticks: { color: '#94A3B8' } },
          x: { grid: { display: false }, ticks: { color: '#94A3B8' } }
        }
      }
    });
  }

  // Dedicated, safe handler functions for the template buttons
  function triggerAllFilter() {
    selectedFilter = 'all';
    initChart();
  }

  function triggerAfricanFilter() {
    selectedFilter = 'african';
    initChart();
  }

  function triggerInternationalFilter() {
    selectedFilter = 'international';
    initChart();
  }

  // Standard function wrapper inside onMount
  onMount(function() {
    initChart();
    return function() {
        if (chartInstance) {
            chartInstance.destroy();
        }
    };
  });
</script>

<main class="dashboard-root">
  <header class="app-header">
    <div class="meta-tag">STUDIO PIPELINE ASSESSMENT</div>
    <h1>The Afrobeats Takeover: Global Streaming Realignment</h1>
    <p class="summary-text">
      An interactive look at the shift in streaming power from 2019 to 2024. Tap or click any point along the line chart vectors to isolate key structural breakthroughs.
    </p>
  </header>

  <div class="interface-grid">
    <div class="chart-section">
      <div class="filter-row">
        <button class:active={selectedFilter === 'all'} on:click={triggerAllFilter}>
          Combined Aggregates
        </button>
        <button class:active={selectedFilter === 'african'} on:click={triggerAfricanFilter}>
          African Regional Only
        </button>
        <button class:active={selectedFilter === 'international'} on:click={triggerInternationalFilter}>
          International Share Only
        </button>
      </div>
      <div class="canvas-holder">
        <canvas bind:this={chartCanvas}></canvas>
      </div>
    </div>

    <div class="story-panel">
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

<style>
  .dashboard-root {
    background: radial-gradient(circle at top left, #14281b 0%, #0F1B14 100%);
    color: #F5F5F5;
    padding: 2.5rem;
    border-radius: 16px;
    max-width: 1140px;
    margin: 2rem auto;
    border: 1px solid rgba(255, 255, 255, 0.03);
  }
  .meta-tag {
    color: #4CDF8A;
    font-size: 0.7rem;
    font-weight: 800;
    letter-spacing: 0.3em;
    margin-bottom: 0.5rem;
  }
  h1 {
    font-family: 'Georgia', serif;
    font-size: 2.5rem;
    margin: 0 0 0.5rem 0;
  }
  .summary-text {
    color: #94A3B8;
    max-width: 800px;
    line-height: 1.6;
    margin-bottom: 2.5rem;
    font-size: 1.05rem;
  }
  .interface-grid {
    display: grid;
    grid-template-columns: 1fr 340px;
    gap: 2rem;
  }
  @media(max-width: 900px) {
    .interface-grid { grid-template-columns: 1fr; }
  }
  .chart-section {
    background: rgba(26, 46, 31, 0.4);
    backdrop-filter: blur(12px);
    border: 1px solid rgba(255, 255, 255, 0.05);
    padding: 1.5rem;
    border-radius: 12px;
  }
  .filter-row {
    display: flex;
    gap: 10px;
    margin-bottom: 1.5rem;
  }
  button {
    background: #1A2E1F;
    border: 1px solid rgba(76, 223, 138, 0.1);
    color: #94A3B8;
    padding: 0.5rem 1rem;
    border-radius: 6px;
    cursor: pointer;
    font-weight: 600;
    font-size: 0.85rem;
    transition: all 0.2s ease;
  }
  button:hover { background: #2E5A36; color: #FFF; }
  button.active { background: #D4A017; color: #0F1B14; border-color: #D4A017; }
  .canvas-holder { height: 400px; position: relative; }
  
  .story-panel {
    background: rgba(26, 46, 31, 0.6);
    backdrop-filter: blur(16px);
    border: 1px solid rgba(255, 255, 255, 0.06);
    padding: 2rem 1.5rem;
    border-radius: 12px;
    display: flex;
    flex-direction: column;
  }
  .year-badge {
    background: #D4A017;
    color: #0F1B14;
    font-weight: 900;
    padding: 0.2rem 0.6rem;
    border-radius: 4px;
    font-size: 0.85rem;
    display: inline-block;
    margin-bottom: 0.75rem;
  }
  h3 { font-family: 'Georgia', serif; font-size: 1.4rem; margin: 0 0 1rem 0; color: #FFF; }
  .metric-card {
    background: rgba(15, 27, 20, 0.8);
    border: 1px solid rgba(76, 223, 138, 0.2);
    padding: 1rem;
    border-radius: 8px;
    margin-bottom: 1.25rem;
  }
  .metric-card .lbl { font-size: 0.7rem; text-transform: uppercase; color: #4CDF8A; display: block; letter-spacing: 0.1em; }
  .metric-card .val { font-size: 1.6rem; font-weight: 800; color: #FFF; display: block; margin-top: 0.25rem; }
  .narrative-body { color: #E2E8F0; line-height: 1.6; font-size: 0.95rem; margin: 0; }
</style>