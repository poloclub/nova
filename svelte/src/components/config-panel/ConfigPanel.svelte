<script lang="ts">
  import { onMount } from 'svelte';
  import type { Graph } from '../graph/Graph';
  import { initForceParameters } from './ConfigPanel';
  import type { ForceParameter } from './ConfigPanel';
  import d3 from '../../d3-imports';

  export let height: number;
  export let myGraph: Graph;

  let component: HTMLElement | null = null;
  let initialized = false;
  let mounted = false;
  let forceParameters: ForceParameter[] | null = null;

  let nodeCount = 0;
  let edgeCount = 0;

  const initView = () => {
    if (myGraph) {
      initialized = true;

      // Construct the parameters
      forceParameters = initForceParameters(myGraph);
    }
  };

  onMount(() => {
    mounted = true;
  });

  $: !initialized && mounted && component && myGraph && initView();
</script>

<style lang="scss">
  @import 'ConfigPanel.scss';
</style>

<div
  class="config-wrapper"
  style={`max-height: ${Math.max(50, height - 30)}px;`}
  bind:this={component}
>
  <span class="title">Force Parameters</span>

  {#if forceParameters !== null}
    {#each forceParameters as parameter}
      <div class="parameter-item">
        <div class="parameter-name">{parameter.name}</div>
        <input
          type="range"
          id={`${parameter.id}-slider`}
          class="slider"
          name={`${parameter.id}`}
          min={parameter.min}
          max={parameter.max}
          value={parameter.value}
          step={parameter.step}
          on:input={e => {
            parameter.updateStrength(parseFloat(e.currentTarget.value));
          }}
        />
      </div>
    {/each}
  {:else}
    <div class="parameter-item">Loading...</div>
  {/if}
</div>
