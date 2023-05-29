<script lang="ts">
  import { loadScene, type SceneSpec } from "../model";
  import SceneViewer from "./SceneViewer.svelte";

  export let source: SceneSpec<string, string>;

  let windowWidth = window.innerWidth;

  window.addEventListener("resize", () => {
    windowWidth = window.innerWidth;
  });

  const canvasWidth = 960;
  const canvasHeight = 540;
</script>

{#if windowWidth <= 960 + 40}
  <div class="item-wrapper">
    Please view this page on a wider screen. Sorry, but this page not display
    properly on mobile devices.
  </div>
{/if}

<div
  class="canvas-wrapper"
  style:width="{canvasWidth}px"
  style:height="{canvasHeight}px"
>
  {#await loadScene(source)}
    <div class="loading">
      <p>Loading</p>
      <p>.</p>
      <p>.</p>
      <p>.</p>
    </div>
  {:then scene}
    <SceneViewer {scene} {canvasHeight} {canvasWidth} />
  {/await}
</div>

<style>
  .canvas-wrapper {
    position: relative;
    margin: auto;
    box-shadow: var(--box-shadow);
    background-color: white;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .loading {
    font-size: 2rem;
    display: flex;
  }

  .loading > :nth-child(n + 2) {
    animation-name: hop;
    animation-duration: 1200ms;
    animation-iteration-count: infinite;
    animation-direction: alternate;
  }

  .loading > :nth-child(2) {
    animation-delay: 500ms;
  }

  .loading > :nth-child(3) {
    animation-delay: 650ms;
  }

  .loading > :nth-child(4) {
    animation-delay: 800ms;
  }

  @keyframes hop {
    85% {
      transform: translateY(0);
    }
    100% {
      transform: translateY(-0.5rem);
    }
  }
</style>
