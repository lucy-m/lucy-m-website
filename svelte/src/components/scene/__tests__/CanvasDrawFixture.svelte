<script lang="ts">
  import type { DrawLayer } from "../../../model";
  import { drawLayerContent } from "../canvas-draw";

  export let drawLayer: DrawLayer;

  let canvasEl: HTMLCanvasElement | undefined;

  $: {
    const ctx = canvasEl?.getContext("2d");
    if (ctx) {
      drawLayerContent(ctx)(drawLayer);
      canvasEl?.setAttribute("data-initialised", "true");
    }
  }
</script>

<canvas
  bind:this={canvasEl}
  width={400}
  height={400}
  style={"border: 1px solid black; background-color: white"}
/>
