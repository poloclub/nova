<script lang="ts">
  import { onMount } from 'svelte';
  import { Graph } from './Graph';
  import type { GraphData, Strengths } from './Graph';
  import ConfigPanel from '../config-panel/ConfigPanel.svelte';
  import iconSetting from '../../images/icon-gear.svg?raw';
  import iconLogo from '../../images/icon-logo.svg?raw';

  export let strengths: Strengths | null = null;
  export let width = 600;
  export let data: GraphData | null = null;

  let myGraph: Graph | null = null;
  let component: HTMLElement | null = null;
  let initialized = false;
  let mounted = false;
  let configPanelStyle = '';

  let nodeCount = 0;
  let edgeCount = 0;
  let configSelected = false;

  const initView = () => {
    if (data) {
      initialized = true;
      if (component) {
        myGraph = new Graph({
          component,
          data,
          strengths,
          width,
          height: width
        });
      }

      nodeCount = data.nodes.length;
      edgeCount = data.links.length;
    }
  };

  const flipConfigSelected = () => {
    configSelected = !configSelected;
  };

  onMount(() => {
    mounted = true;
    // Check if the screen is small; if so, we show the config panel on top of
    // the main window
    const panelRoom = Math.floor((window.innerWidth - width) / 2);
    if (panelRoom < 190) {
      configPanelStyle = configPanelStyle.concat(
        `transform: translateX(calc(100% - ${190 - panelRoom + 5}px)); \
         top: 42px;`
      );
    }
  });

  $: !initialized && mounted && component && data && initView();
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
    <span>{`${nodeCount} nodes, ${edgeCount} edges`}</span>
    <a href="https://github.com/poloclub/nova" target="_blank"
      ><span class="name">{@html iconLogo}</span></a
    >
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
  <div
    class="config-container"
    class:no-display={!configSelected}
    style={configPanelStyle}
  >
    <ConfigPanel height={width} {myGraph} {flipConfigSelected} />
  </div>
</div>
