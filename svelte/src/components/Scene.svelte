<script lang="ts">
  import { type Layer } from "../model";
  import SceneViewer from "./SceneViewer.svelte";

  export let source: Promise<Layer[]>;

  const canvasWidth = 960;
  const canvasHeight = 540;
</script>

<div
  class="canvas-wrapper"
  style:width="{canvasWidth}px"
  style:height="{canvasHeight}px"
>
  {#await source}
    <p>Loading</p>
  {:then images}
    <SceneViewer layers={images} {canvasHeight} {canvasWidth} />
  {/await}
</div>

<style>
  .canvas-wrapper {
    position: relative;
    margin: auto;
    box-shadow: 0px 2px 6px 2px var(--color-box-shadow);
    background-color: white;
  }
</style>
