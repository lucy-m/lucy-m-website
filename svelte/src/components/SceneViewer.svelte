<script lang="ts">
  import { type Subscription } from "rxjs";
  import { onDestroy, onMount } from "svelte";
  import {
    PosFns,
    addLayer,
    breakText,
    getLayerContentInOrder,
    resolveScene,
    throttleLayers,
    type LayerByLayerKey,
    type LoadedScene,
  } from "../model";

  type TLayerKey = $$Generic<string>;
  type TAssetKey = $$Generic<string>;

  export let scene: LoadedScene<TLayerKey, TAssetKey>;

  export let canvasWidth: number;
  export let canvasHeight: number;

  const imageWidth = 1920;
  const imageHeight = 1080;

  const lineHeight = 53;

  let canvas: HTMLCanvasElement;
  let ctx: CanvasRenderingContext2D | null;

  let imagesByLayer: LayerByLayerKey<TLayerKey> = {};

  const redrawCanvas = () => {
    if (ctx) {
      ctx.clearRect(0, 0, canvasWidth, canvasHeight);

      const drawOrder = getLayerContentInOrder(
        scene.layerOrder,
        scene.layerOrigins,
        imagesByLayer
      );

      drawOrder.forEach((layer) => {
        const content = layer.content;

        if (content.kind === "image") {
          ctx?.drawImage(content.image, layer.position.x, layer.position.y);
        } else {
          const measureText = (s: string) => ctx?.measureText(s)?.width ?? 0;
          const lines = content.text.flatMap((t) =>
            breakText(t, content.maxWidth, measureText)
          );

          lines.forEach((line, index) => {
            const position = PosFns.add(
              layer.position,
              PosFns.new(0, index * lineHeight)
            );
            ctx?.fillText(line, position.x, position.y);
          });
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

    const resolved = resolveScene(scene);

    subscription = throttleLayers<TLayerKey>(resolved.layers).subscribe(
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
