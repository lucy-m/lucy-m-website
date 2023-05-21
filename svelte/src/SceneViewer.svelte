<script lang="ts">
  import type { Subscription } from "rxjs";
  import { onDestroy, onMount } from "svelte";
  import { loadIntroScene, throttleImages } from "./scenes/intro-scene";

  let bgFillCanvas: HTMLCanvasElement;
  let bgOutlineCanvas: HTMLCanvasElement;
  let personFillCanvas: HTMLCanvasElement;
  let personOutlineCanvas: HTMLCanvasElement;
  let subscription: Subscription | undefined = undefined;

  const canvasWidth = 960;
  const canvasHeight = 540;
  const imageWidth = 1920;
  const imageHeight = 1080;

  const loadScene = loadIntroScene();

  onMount(() => {
    const bgFillCtx = bgFillCanvas.getContext("2d");
    const bgOutlineCtx = bgOutlineCanvas.getContext("2d");
    const personFillCtx = personFillCanvas.getContext("2d");
    const personOutlineCtx = personOutlineCanvas.getContext("2d");

    if (bgFillCtx && bgOutlineCtx && personFillCtx && personOutlineCtx) {
      [bgFillCtx, bgOutlineCtx, personFillCtx, personOutlineCtx].forEach(
        (ctx) => {
          ctx.setTransform(
            canvasWidth / imageWidth,
            0,
            0,
            canvasHeight / imageHeight,
            0,
            0
          );
        }
      );

      loadScene.then((images) => {
        bgFillCtx.clearRect(0, 0, canvasWidth, canvasHeight);
        subscription = throttleImages(images).subscribe(({ image, layer }) => {
          switch (layer) {
            case "bg-outline": {
              bgOutlineCtx.drawImage(image, 0, 0);
              return;
            }
            case "bg-fill": {
              bgFillCtx.drawImage(image, 0, 0);
              return;
            }
            case "person-outline": {
              personOutlineCtx.drawImage(image, 0, 0);
              return;
            }
            case "person-fill": {
              personFillCtx.drawImage(image, 0, 0);
              return;
            }
          }
        });
      });
    } else {
      throw new Error("Unable to get 2d render context");
    }
  });

  onDestroy(() => {
    if (subscription) {
      subscription.unsubscribe();
    }
  });
</script>

<div
  class="canvas-wrapper"
  style:width="{canvasWidth}px"
  style:height="{canvasHeight}px"
>
  <canvas
    width="{canvasWidth}px"
    height="{canvasHeight}px"
    bind:this={bgFillCanvas}
  />
  <canvas
    width="{canvasWidth}px"
    height="{canvasHeight}px"
    bind:this={bgOutlineCanvas}
  />
  <canvas
    width="{canvasWidth}px"
    height="{canvasHeight}px"
    bind:this={personFillCanvas}
  />
  <canvas
    width="{canvasWidth}px"
    height="{canvasHeight}px"
    bind:this={personOutlineCanvas}
  />
</div>

<style>
  .canvas-wrapper {
    position: relative;
    margin: auto;
    box-shadow: 0px 2px 6px 2px var(--color-box-shadow);
    background-color: "white";
  }

  canvas {
    position: absolute;
    top: 0;
    left: 0;
  }
</style>
