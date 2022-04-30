<script lang="ts">
  import Graph from './components/graph/Graph.svelte';
</script>

<style lang="scss">
  .main-app {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    height: calc(100vh - 5px);
    max-height: 800px;
    width: 100vw;
    box-sizing: border-box;
    overflow-x: hidden;

    position: relative;
  }
</style>

<div class="main-app">
  <Graph />
</div>
