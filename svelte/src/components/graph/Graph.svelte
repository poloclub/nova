<script lang="ts">
  import { onMount } from 'svelte';
  import { Graph } from './Graph';
  import type { GraphData, Strengths } from './Graph';
  import ConfigPanel from '../config-panel/ConfigPanel.svelte';
  import d3 from '../../d3-imports';
  import iconSetting from '../../images/icon-gear.svg?raw';

  export let modelFile: string | null = null;
  export let strengths: Strengths | null = null;
  export let width: number = 600;

  let myGraph: Graph | null = null;
  let component: HTMLElement | null = null;
  let initialized = false;
  let mounted = false;

  let nodeCount = 0;
  let edgeCount = 0;
  let configSelected = false;

  const initView = async () => {
    initialized = true;
    const loadedData = (await d3.json(
      `${import.meta.env.BASE_URL}data/${modelFile}`
    )) as GraphData;

    const height = width;

    if (component) {
      myGraph = new Graph({
        component,
        data: loadedData,
        strengths,
        width,
        height
      });
    }

    nodeCount = loadedData.nodes.length;
    edgeCount = loadedData.links.length;
  };

  const flipConfigSelected = () => {
    configSelected = !configSelected;
  };

  onMount(() => {
    mounted = true;
  });

  $: !initialized && mounted && component && modelFile && initView();
</script>

<style lang="scss">
  @import 'Graph.scss';
</style>

<div
  class="graph-wrapper"
  style={`width: ${width}px; height: ${width}px;`}
  bind:this={component}
>
  <svg class="graph-svg" />

  <div class="graph-footer">
    {`${nodeCount} nodes, ${edgeCount} edges`}
  </div>

  <div
    class="config-button"
    class:selected={configSelected}
    on:click={() => {
      flipConfigSelected();
    }}
  >
    {@html iconSetting}
  </div>
  <div class="config-container" class:no-display={!configSelected}>
    <ConfigPanel height={width} {myGraph} {flipConfigSelected} />
  </div>
</div>
