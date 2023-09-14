<script lang="ts">
  import type { DrawLayer } from "../../../model";
  import { drawLayerContent } from "../../../scenes/drawing/canvas-draw";

  export let drawLayers: DrawLayer[];

  let canvasEl: HTMLCanvasElement | undefined;

  $: {
    const ctx = canvasEl?.getContext("2d");
    if (ctx) {
      drawLayers.forEach(drawLayerContent(ctx));
      canvasEl?.setAttribute("data-initialised", "true");
    }
  }
</script>

<canvas
  bind:this={canvasEl}
  width={400}
  height={400}
  style={"background-color: white"}
/>
