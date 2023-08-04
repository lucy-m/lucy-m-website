<script lang="ts">
  import type { AssetKey } from "../model/assets";

  import { type Subscription } from "rxjs";
  import { onDestroy, onMount } from "svelte";
  import {
    PosFns,
    applySceneAction,
    breakText,
    resolveScene,
    type SceneType,
  } from "../model";

  type TLayerKey = $$Generic<string>;

  export let scene: SceneType<TLayerKey>;
  export let images: Record<AssetKey, HTMLImageElement>;

  export let canvasWidth: number;
  export let canvasHeight: number;

  const imageWidth = 1920;
  const imageHeight = 1080;

  const lineHeight = 53;

  let canvas: HTMLCanvasElement;
  let ctx: CanvasRenderingContext2D | null;

  const redrawCanvas = () => {
    if (ctx) {
      ctx.clearRect(0, 0, canvasWidth, canvasHeight);

      const drawLayers = resolveScene(scene, images);

      drawLayers.forEach((layer) => {
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

      redrawCanvas();
    }
  });

  onDestroy(() => {
    if (subscription) {
      subscription.unsubscribe();
    }
  });

  const onInteract = () => {
    const newScene = scene.objects.reduce((acc, obj) => {
      const action = obj.onInteract ? obj.onInteract(obj) : undefined;

      if (action) {
        return applySceneAction(acc, action, obj.id);
      } else {
        return acc;
      }
    }, scene);

    scene = newScene;
    redrawCanvas();
  };
</script>

<canvas
  width="{canvasWidth}px"
  height="{canvasHeight}px"
  on:click={onInteract}
  bind:this={canvas}
/>

<style>
  canvas {
    width: 100%;
  }
</style>
