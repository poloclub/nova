<script lang="ts">
  import { onMount } from 'svelte';
  import { Graph } from './Graph';
  import type { GraphData } from './Graph';
  import d3 from '../d3-imports';

  let myGraph: Graph | null = null;
  let component: HTMLElement | null = null;
  let initialized = false;
  let mounted = false;

  const width = 600;
  const height = 600;

  const initView = async () => {
    initialized = true;
    const modelFile = 'miserables.json';
    const loadedData = (await d3.json(
      `${import.meta.env.BASE_URL}data/${modelFile}`
    )) as GraphData;

    if (component) {
      myGraph = new Graph({
        component,
        data: loadedData,
        width,
        height
      });
    }
  };

  onMount(() => {
    mounted = true;
  });

  $: !initialized && mounted && component && initView();
</script>

<style lang="scss">
  @import 'Graph.scss';
</style>

<div
  class="graph-wrapper"
  style={`width: ${width}; height: ${height}`}
  bind:this={component}
>
  <svg class="graph-svg" />
</div>
