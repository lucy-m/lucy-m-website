<script lang="ts">
  import { makeNumberSpring } from "../../model/spring-store";
  import ObnoxiousButton from "./ObnoxiousButton.svelte";
  import SpringImage from "./SpringImage.svelte";

  export let images: { src: string; alt: string }[];
  export let text: string[];

  let showIndex = 0;

  const prevSpring = makeNumberSpring({
    endPoint: 0,
    position: 0,
    velocity: 0,
    properties: {
      friction: 2.5,
      precision: 0.1,
      stiffness: 0.2,
      weight: 1.5,
    },
  });

  const nextSpring = makeNumberSpring({
    endPoint: 0,
    position: 0,
    velocity: 0,
    properties: {
      friction: 2.5,
      precision: 0.1,
      stiffness: 0.2,
      weight: 1.5,
    },
  });

  const goToNextImage = () => {
    showIndex = Math.min(showIndex + 1, images.length - 1);
    nextSpring.update((s) => ({ endPoint: s.endPoint + 360 }));
  };

  const goToPrevImage = () => {
    showIndex = Math.max(showIndex - 1, 0);
    prevSpring.update((s) => ({ endPoint: s.endPoint - 360 }));
  };
</script>

<div class="images-and-buttons">
  <ObnoxiousButton
    onClick={goToPrevImage}
    label="Previous"
    direction="counter-clockwise"
  />
  <div class="image-wrapper" data-testid="images-and-text">
    {#each images as image, index}
      <SpringImage
        {image}
        myIndex={index}
        {showIndex}
        imageCount={images.length}
      />
    {/each}
  </div>
  <ObnoxiousButton
    onClick={goToNextImage}
    label="Next"
    direction="clockwise"
    iconSrc="/arrow-right.png"
  />
</div>

{#each text as t}
  <p>{t}</p>
{/each}

<style>
  .images-and-buttons {
    display: flex;
    align-items: center;
  }

  .image-wrapper {
    position: relative;
    width: 200px;
    height: 200px;
    overflow: hidden;
  }
</style>
