<script lang="ts">
  import { type ImageWithLayer } from "../model";
  import SceneViewer from "./SceneViewer.svelte";

  export let source: Promise<ImageWithLayer[]>;

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
    <SceneViewer {images} {canvasHeight} {canvasWidth} />
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
