<script lang="ts">
  import { onDestroy, onMount } from "svelte";
  import type { Unsubscriber } from "svelte/store";
  import { loadIntroScene } from "./scenes/intro-scene";

  let canvas: HTMLCanvasElement;
  let unsub: Unsubscriber | undefined = undefined;

  const scene = loadIntroScene();

  onMount(() => {
    const ctx = canvas.getContext("2d");

    if (ctx) {
      unsub = scene.subscribe((fetchState) => {
        switch (fetchState.kind) {
          case "loading":
            return;
          case "error":
            return;
          case "loaded": {
            fetchState.data.images.forEach((image) => {
              ctx.drawImage(image, 0, 0);
            });
          }
        }
      });
    } else {
      throw new Error("Unable to get 2d render context");
    }
  });

  onDestroy(() => {
    if (unsub) {
      unsub();
    }
  });
</script>

<canvas width="1920px" height="1080px" bind:this={canvas} />
