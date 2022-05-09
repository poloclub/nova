<script lang="ts">
  import d3 from './d3-imports';
  import Graph from './components/graph/Graph.svelte';
  import { onMount } from 'svelte';
  import type { GraphData, Strengths } from './components/graph/Graph';
  import iconRocket from './images/icon-rocket.svg?raw';

  export let notebookMode = false;
  let showIFrame = false;

  /**
   * Custom event for notebook message events
   */
  interface NotebookEvent extends Event {
    data: GraphData;
    width: number;
    nodeStrength: number;
    linkStrength: number;
    linkDistance: number;
    collideStrength: number;
  }

  const datasets = [
    {
      name: 'Les Misérables Character',
      file: 'miserables.json',
      strengths: null
    },
    {
      name: 'StackOverflow Tag',
      file: 'stackoverflow.json',
      strengths: { linkStrength: 4, collideStrength: 10 }
    },
    { name: 'Karate Club', file: 'karate.json', strengths: null }
  ];

  let curDatasetIndex = 0;
  let width = 600;
  let data: GraphData | null = null;
  let strengths: Strengths | null = null;

  onMount(async () => {
    if (notebookMode) {
      if (notebookMode) {
        // Listen to the iframe message events
        document.addEventListener('novaGraphData', (e: Event) => {
          const notebookEvent = e as NotebookEvent;
          data = notebookEvent.data;
          width = notebookEvent.width;
          strengths = {
            nodeStrength: notebookEvent.nodeStrength,
            linkStrength: notebookEvent.linkStrength,
            linkDistance: notebookEvent.linkDistance,
            collideStrength: notebookEvent.collideStrength
          };
        });
      }
    } else {
      // Directly load the data
      data = (await d3.json(
        `${import.meta.env.BASE_URL}data/${datasets[curDatasetIndex].file}`
      )) as GraphData;
      strengths = datasets[curDatasetIndex].strengths;
    }
  });
</script>

<style lang="scss">
  @import 'App.scss';
</style>

<div class="demo-page">
  <div class="main-app" class:notebook={notebookMode}>
    <div class="top-grid">
      <span class="right-header">Web App</span>
      {#if !notebookMode}
        <div class="dataset-container">
          <div class="dataset-title">Choose a graph</div>

          {#each datasets as dataset, i}
            <div
              class="dataset-option"
              class:selected={curDatasetIndex === i}
              on:click={async () => {
                curDatasetIndex = i;
                data = await d3.json(
                  `${import.meta.env.BASE_URL}data/${
                    datasets[curDatasetIndex].file
                  }`
                );
                strengths = datasets[curDatasetIndex].strengths;
              }}
            >
              {dataset.name}
            </div>
          {/each}
        </div>
      {/if}

      {#key data}
        <div
          class="graph-container"
          class:left-align={notebookMode}
          style={`width: ${width}px;`}
        >
          <Graph {strengths} {width} {data} />
        </div>
      {/key}
    </div>
  </div>

  <div class="jupyter-demo-wrapper">
    <span class="right-header">Notebook Widget</span>

    <div class="jupyter-demo">
      {#if showIFrame}
        <iframe
          title="Jupyter notebook"
          src="https://poloclub.github.io/nova/notebook/retro/notebooks/?path=nova-graph.ipynb"
          width="100%"
          height="100%"
        />
      {:else}
        <div
          class="demo-placeholder"
          on:click={() => {
            showIFrame = true;
          }}
        >
          <div class="mask" />
          <img
            alt="Jupyter notebook place holder"
            src={`${import.meta.env.BASE_URL}data/jupyter-placeholder.png`}
          />
          <div
            class="button"
            on:click={() => {
              showIFrame = true;
            }}
          >
            <span class="svg-icon">{@html iconRocket}</span>Launch Jupyter
            Notebook
          </div>
        </div>
      {/if}
    </div>
  </div>
</div>
