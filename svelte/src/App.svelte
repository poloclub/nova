<script lang="ts">
  import Graph from './components/graph/Graph.svelte';

  let curDatasetIndex = 0;
  const datasets = [
    {
      name: 'Les Misérables Character',
      file: 'miserables.json',
      strengths: null
    },
    {
      name: 'StackOverflow Tag',
      file: 'stackoverflow.json',
      strengths: { linkStrength: 3.6 }
    },
    { name: 'Karate Club', file: 'karate.json', strengths: null }
  ];
</script>

<style lang="scss">
  @import 'App.scss';
</style>

<div class="main-app">
  <div class="top-grid">
    <div class="dataset-container">
      <div class="dataset-title">Choose a graph</div>

      {#each datasets as dataset, i}
        <div
          class="dataset-option"
          class:selected={curDatasetIndex === i}
          on:click={() => {
            curDatasetIndex = i;
          }}
        >
          {dataset.name}
        </div>
      {/each}
    </div>

    {#key curDatasetIndex}
      <div class="graph-container">
        <Graph
          modelFile={datasets[curDatasetIndex].file}
          strengths={datasets[curDatasetIndex].strengths}
        />
      </div>
    {/key}
  </div>
</div>
