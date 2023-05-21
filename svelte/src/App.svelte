<script lang="ts">
  import { onMount } from "svelte";
  import SceneViewer from "./SceneViewer.svelte";
  import finny from "./assets/finny.png";

  let canvas: HTMLCanvasElement;

  const image = new Image();

  const imageLoadPromise = new Promise<void>((resolve, reject) => {
    image.onload = () => resolve();
    setTimeout(() => {
      image.src = finny;
    }, 2000);
  });

  onMount(() => {
    const ctx = canvas.getContext("2d");

    if (ctx) {
      imageLoadPromise.then(() => {
        ctx.clearRect(0, 0, 600, 400);
        ctx.drawImage(image, 10, 10);
      });

      ctx.font = "30px Arial";
      ctx.fillText("Loading please stand by...", 20, 50);
    }
  });
</script>

<SceneViewer />

<canvas width="600px" height="400px" bind:this={canvas} />

<style>
  canvas {
    display: block;
    margin: auto;
    box-shadow: 0px 2px 6px 2px var(--color-box-shadow);
    background-color: hsl(143.71deg 43.79% 96.1%);
  }
</style>
