<script lang="ts">
  import { Subject, type Subscription } from "rxjs";
  import { onDestroy, onMount } from "svelte";
  import {
    throttleImages,
    type ImageLayer,
    type ImageWithLayer,
  } from "../scenes/intro-scene";
  import LayerCanvas from "./LayerCanvas.svelte";

  export let images: ImageWithLayer[];

  export let canvasWidth: number;
  export let canvasHeight: number;

  const layerImages: Record<ImageLayer, Subject<ImageWithLayer>> = {
    bg: new Subject(),
    person: new Subject(),
  };

  let subscription: Subscription | undefined = undefined;

  onMount(() => {
    subscription = throttleImages(images).subscribe((image) => {
      layerImages[image.layer].next(image);
    });
  });

  onDestroy(() => {
    if (subscription) {
      subscription.unsubscribe();
    }
  });
</script>

<LayerCanvas {canvasWidth} {canvasHeight} images={layerImages["bg"]} />
<LayerCanvas {canvasWidth} {canvasHeight} images={layerImages["person"]} />
