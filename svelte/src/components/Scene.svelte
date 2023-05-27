<script lang="ts">
  import { loadScene, type SceneModel } from "../model";
  import SceneViewer from "./SceneViewer.svelte";

  export let source: SceneModel<string, string>;

  const canvasWidth = 960;
  const canvasHeight = 540;
</script>

<div
  class="canvas-wrapper"
  style:width="{canvasWidth}px"
  style:height="{canvasHeight}px"
>
  {#await loadScene(source)}
    <p>Loading</p>
  {:then scene}
    <SceneViewer {scene} {canvasHeight} {canvasWidth} />
  {/await}
</div>

<style>
  .canvas-wrapper {
    position: relative;
    margin: auto;
    box-shadow: 0px 2px 6px 2px var(--color-box-shadow);
    background-color: white;
    display: flex;
    align-items: center;
    justify-content: center;
  }
</style>
