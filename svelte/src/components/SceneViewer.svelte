<script lang="ts">
  import { Subject, interval, map, merge } from "rxjs";

  import type { AssetKey } from "../model/assets";

  import { onDestroy, onMount } from "svelte";
  import {
    PosFns,
    applySceneAction,
    breakText,
    resolveScene,
    type SceneAction,
    type SceneType,
  } from "../model";

  type TLayerKey = $$Generic<string>;

  export let scene: SceneType<TLayerKey>;
  export let images: Record<AssetKey, HTMLImageElement>;

  const imageWidth = 1920;
  const imageHeight = 1080;

  const lineHeight = 53;

  let canvas: HTMLCanvasElement;
  let ctx: CanvasRenderingContext2D | null;

  const redrawCanvas = () => {
    if (ctx) {
      ctx.clearRect(0, 0, imageWidth, imageHeight);

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

  onMount(() => {
    ctx = canvas.getContext("2d");

    if (ctx) {
      ctx.font = "42px Quicksand";
    }

    redrawCanvas();
  });

  const interactSub = new Subject<void>();

  const subscription = merge(
    interval(30).pipe(map(() => ({ kind: "tick" } as SceneAction))),
    interactSub.pipe(map(() => ({ kind: "interact" } as SceneAction)))
  ).subscribe((action) => {
    scene = applySceneAction(scene, action);
    redrawCanvas();
  });

  onDestroy(() => {
    subscription?.unsubscribe();
  });
</script>

<canvas
  width="{imageWidth}px"
  height="{imageHeight}px"
  on:click={() => interactSub.next()}
  bind:this={canvas}
/>

<style>
  canvas {
    width: 100%;
    max-height: 95vh;
  }
</style>
