<script lang="ts">
  import { Subscription, type Observable } from "rxjs";
  import { onMount } from "svelte";
  import type { ImageWithLayer } from "../scenes/intro-scene";

  export let canvasWidth: number;
  export let canvasHeight: number;
  export let images: Observable<ImageWithLayer>;

  const imageWidth = 1920;
  const imageHeight = 1080;

  let fillCanvas: HTMLCanvasElement;
  let outlineCanvas: HTMLCanvasElement;
  let subscription: Subscription | undefined = undefined;

  onMount(() => {
    const fillCtx = fillCanvas.getContext("2d");
    const outlineCtx = outlineCanvas.getContext("2d");

    if (fillCtx && outlineCtx) {
      [fillCtx, outlineCtx].forEach((ctx) => {
        ctx.setTransform(
          canvasWidth / imageWidth,
          0,
          0,
          canvasHeight / imageHeight,
          0,
          0
        );
      });

      subscription = images.subscribe(({ image, type }) => {
        switch (type) {
          case "outline": {
            outlineCtx.drawImage(image, 0, 0);
            return;
          }
          case "fill": {
            fillCtx.drawImage(image, 0, 0);
            return;
          }
        }
      });
    } else {
      throw new Error("Unable to get 2d render context");
    }
  });
</script>

<canvas
  width="{canvasWidth}px"
  height="{canvasHeight}px"
  bind:this={fillCanvas}
/>
<canvas
  width="{canvasWidth}px"
  height="{canvasHeight}px"
  bind:this={outlineCanvas}
/>

<style>
  canvas {
    position: absolute;
    top: 0;
    left: 0;
  }
</style>
