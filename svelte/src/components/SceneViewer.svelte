<script lang="ts">
  import { type Subscription } from "rxjs";
  import { onDestroy, onMount } from "svelte";
  import {
    addLayer,
    getLayerContentInOrder,
    throttleLayers,
    type ContentByLayer,
    type LoadedScene,
  } from "../model";

  type TLayerKey = $$Generic<string>;

  export let scene: LoadedScene<TLayerKey>;

  export let canvasWidth: number;
  export let canvasHeight: number;

  const imageWidth = 1920;
  const imageHeight = 1080;

  let canvas: HTMLCanvasElement;
  let ctx: CanvasRenderingContext2D | null;

  let imagesByLayer: ContentByLayer<TLayerKey> = {};

  const redrawCanvas = () => {
    if (ctx) {
      ctx.clearRect(0, 0, canvasWidth, canvasHeight);

      const drawOrder = getLayerContentInOrder(
        scene.layerOrder,
        scene.layerOrigins,
        imagesByLayer
      );

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
      ctx.font = "42px Quicksand";
    }

    subscription = throttleLayers<TLayerKey>(scene.layers).subscribe(
      (image) => {
        imagesByLayer = addLayer(image, imagesByLayer);
        requestAnimationFrame(() => {
          redrawCanvas();
        });
      }
    );
  });

  onDestroy(() => {
    if (subscription) {
      subscription.unsubscribe();
    }
  });
</script>

<canvas width="{canvasWidth}px" height="{canvasHeight}px" bind:this={canvas} />
