<script lang="ts">
  import { onMount } from 'svelte';
  import type { Graph } from '../graph/Graph';
  import { initForceParameters } from './ConfigPanel';
  import type { ForceParameter } from './ConfigPanel';
  import d3 from '../../d3-imports';
  import iconClose from '../../images/icon-close.svg?raw';

  export let height: number;
  export let myGraph: Graph | null = null;
  export let flipConfigSelected: () => void = () => {};

  let component: HTMLElement | null = null;
  let initialized = false;
  let mounted = false;
  let forceParameters: ForceParameter[] | null = null;

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
  class="parameter-wrapper"
  style={`max-height: ${Math.max(50, height - 30)}px;`}
  bind:this={component}
>
  <div class="parameter-title">
    <span>Force Parameters</span>
    <span class="svg-icon" on:click={() => flipConfigSelected()}
      >{@html iconClose}</span
    >
  </div>

  {#if forceParameters !== null}
    {#each forceParameters as parameter}
      <div class="parameter-item">
        <div class="parameter">
          <span class="parameter-name">{parameter.name}</span>
          <span class="parameter-value">{parameter.value}</span>
        </div>

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
            parameter.value = parseFloat(e.currentTarget.value);
            parameter.updateStrength(parseFloat(e.currentTarget.value));
          }}
        />
      </div>
    {/each}
  {:else}
    <div class="parameter-item">Loading...</div>
  {/if}
</div>
