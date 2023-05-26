<script lang="ts">
  import { type Subscription } from "rxjs";
  import { onDestroy, onMount } from "svelte";
  import {
    addImage,
    emptyImagesByLayer,
    getImagesInOrder,
    type ImageWithLayer,
    type ImagesByLayer,
  } from "../model";
  import { throttleImages } from "../scenes/intro-scene";

  export let images: ImageWithLayer[];

  export let canvasWidth: number;
  export let canvasHeight: number;

  const imageWidth = 1920;
  const imageHeight = 1080;

  let canvas: HTMLCanvasElement;
  let ctx: CanvasRenderingContext2D | null;

  let imagesByLayer: ImagesByLayer = emptyImagesByLayer;

  const redrawCanvas = () => {
    if (ctx) {
      ctx.clearRect(0, 0, canvasWidth, canvasHeight);

      const drawOrder = getImagesInOrder(imagesByLayer);

      drawOrder.forEach(({ image, position }) => {
        ctx?.drawImage(image, position.x, position.y);
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
      ctx.font = "30px Quicksand";
    }

    subscription = throttleImages(images).subscribe((image) => {
      imagesByLayer = addImage(image, imagesByLayer);
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
