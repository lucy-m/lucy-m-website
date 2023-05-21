<script lang="ts">
  import type { Subscription } from "rxjs";
  import { onDestroy, onMount } from "svelte";
  import { loadIntroScene, throttleImages } from "./scenes/intro-scene";

  let bgCanvas: HTMLCanvasElement;
  let subscription: Subscription | undefined = undefined;

  const canvasWidth = 960;
  const canvasHeight = 540;
  const imageWidth = 1920;
  const imageHeight = 1080;

  const loadScene = loadIntroScene();

  onMount(() => {
    const ctx = bgCanvas.getContext("2d");

    if (ctx) {
      ctx.globalCompositeOperation = "destination-over";
      ctx.setTransform(
        canvasWidth / imageWidth,
        0,
        0,
        canvasHeight / imageHeight,
        0,
        0
      );
      ctx.font = "60px Arial";
      ctx.fillText("Loading!", 40, 80);

      loadScene.then((images) => {
        ctx.clearRect(0, 0, canvasWidth, canvasHeight);
        subscription = throttleImages(images).subscribe((image) => {
          ctx.drawImage(image, 0, 0);
        });
      });
    } else {
      throw new Error("Unable to get 2d render context");
    }
  });

  onDestroy(() => {
    if (subscription) {
      subscription.unsubscribe();
    }
  });
</script>

<div
  class="canvas-wrapper"
  style:width="{canvasWidth}px"
  style:height="{canvasHeight}px"
>
  <canvas
    width="{canvasWidth}px"
    height="{canvasHeight}px"
    bind:this={bgCanvas}
  />
</div>

<style>
  .canvas-wrapper {
    position: relative;
    margin: auto;
    box-shadow: 0px 2px 6px 2px var(--color-box-shadow);
    background-color: "white";
  }

  canvas {
    position: absolute;
    top: 0;
    left: 0;
  }
</style>
