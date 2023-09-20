<script lang="ts">
  import seedrandom from "seedrandom";
  import { loadImages, type SceneSpec } from "../../model";
  import { viewScene } from "../../scenes/drawing";

  export let sceneSpec: SceneSpec;

  let windowWidth = window.innerWidth;
  let windowHeight = window.innerHeight;

  const r = seedrandom().int32();
  console.log("Congratulations! Your random seed is", r);

  window.addEventListener("resize", () => {
    windowWidth = window.innerWidth;
    windowHeight = window.innerHeight;
  });
</script>

{#if windowWidth <= 800}
  {#if windowHeight >= 800}
    <div class="item-wrapper" aria-hidden="true">
      If you're on mobile you should rotate your device! If not, make the window
      bigger or zoom out.
    </div>
  {/if}
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
    <canvas
      use:viewScene={{
        initialSceneSpec: sceneSpec,
        images,
        seed: r.toString(),
      }}
    />
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
  canvas {
    width: 100%;
    max-height: 95vh;
  }

  .loading {
    font-size: 2rem;
    display: flex;
    align-items: baseline;
    padding: 48px 96px;
  }

  .loading p {
    margin-top: 0;
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
