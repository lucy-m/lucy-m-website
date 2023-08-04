<script lang="ts">
  import { type SceneType } from "../model";
  import { loadImages } from "../model/assets";
  import SceneViewer from "./SceneViewer.svelte";

  export let scene: SceneType<string>;

  let windowWidth = window.innerWidth;

  window.addEventListener("resize", () => {
    windowWidth = window.innerWidth;
  });

  const canvasWidth = 1920;
  const canvasHeight = 1080;
</script>

{#if windowWidth <= 800}
  <div class="item-wrapper">
    Please view this page on a wider screen. Sorry, but this page may display
    properly on mobile devices.
  </div>
{/if}

<div class="canvas-wrapper">
  {#await loadImages()}
    <div class="loading">
      <p>Loading</p>
      <p>.</p>
      <p>.</p>
      <p>.</p>
    </div>
  {:then images}
    <SceneViewer {scene} {images} {canvasHeight} {canvasWidth} />
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
