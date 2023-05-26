<script lang="ts">
  import { type Subscription } from "rxjs";
  import { onDestroy, onMount } from "svelte";
  import {
    addLayer,
    emptyContentByLayer,
    getLayerContentInOrder,
    type ContentByLayer,
    type Layer,
  } from "../model";
  import { throttleLayers } from "../scenes/intro-scene";

  export let layers: Layer[];

  export let canvasWidth: number;
  export let canvasHeight: number;

  const imageWidth = 1920;
  const imageHeight = 1080;

  let canvas: HTMLCanvasElement;
  let ctx: CanvasRenderingContext2D | null;

  let imagesByLayer: ContentByLayer = emptyContentByLayer;

  const redrawCanvas = () => {
    if (ctx) {
      ctx.clearRect(0, 0, canvasWidth, canvasHeight);

      const drawOrder = getLayerContentInOrder(imagesByLayer);

      drawOrder.forEach((content) => {
        if (content.kind === "image") {
          ctx?.drawImage(content.image, content.position.x, content.position.y);
        } else {
          ctx?.fillText(content.text, content.position.x, content.position.y);
        }
      });
    }
  };

  let subscription: Subscription | undefined = undefined;

  onMount(() => {
    ctx = canvas.getContext("2d");

    if (ctx) {
      ctx.setTransform(
        canvasWidth / imageWidth,
        0,
        0,
        canvasHeight / imageHeight,
        0,
        0
      );
      ctx.font = "48px Quicksand";
    }

    subscription = throttleLayers(layers).subscribe((image) => {
      imagesByLayer = addLayer(image, imagesByLayer);
      requestAnimationFrame(() => {
        redrawCanvas();
      });
    });
  });

  onDestroy(() => {
    if (subscription) {
      subscription.unsubscribe();
    }
  });
</script>

<canvas width="{canvasWidth}px" height="{canvasHeight}px" bind:this={canvas} />
