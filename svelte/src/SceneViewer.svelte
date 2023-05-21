<script lang="ts">
  import { onDestroy, onMount } from "svelte";
  import type { Unsubscriber } from "svelte/store";
  import { loadIntroScene } from "./scenes/intro-scene";

  let canvas: HTMLCanvasElement;
  let unsub: Unsubscriber | undefined = undefined;

  const canvasWidth = 960;
  const canvasHeight = 540;
  const imageWidth = 1920;
  const imageHeight = 1080;

  const scene = loadIntroScene();

  onMount(() => {
    const ctx = canvas.getContext("2d");

    if (ctx) {
      ctx.setTransform(
        canvasWidth / imageWidth,
        0,
        0,
        canvasHeight / imageHeight,
        0,
        0
      );
      ctx.font = "30px Arial";

      unsub = scene.subscribe((fetchState) => {
        ctx.clearRect(0, 0, canvasWidth, canvasHeight);

        switch (fetchState.kind) {
          case "loading": {
            ctx.fillText("Loading", 40, 40);
            return;
          }
          case "error": {
            ctx.fillText("Something went wrong :(", 40, 40);
            return;
          }
          case "loaded": {
            fetchState.data.images.forEach((image) => {
              ctx.drawImage(image, 0, 0);
            });
            return;
          }
        }
      });
    } else {
      throw new Error("Unable to get 2d render context");
    }
  });

  onDestroy(() => {
    if (unsub) {
      unsub();
    }
  });
</script>

<canvas width="{canvasWidth}px" height="{canvasHeight}px" bind:this={canvas} />

<style>
  canvas {
    display: block;
    margin: auto;
    box-shadow: 0px 2px 6px 2px var(--color-box-shadow);
  }
</style>
