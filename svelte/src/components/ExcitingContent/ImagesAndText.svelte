<script lang="ts">
  import ObnoxiousButton from "./ObnoxiousButton.svelte";
  import SpringImage from "./SpringImage.svelte";

  export let images: { src: string; alt: string }[];
  export let text: string[];

  let showIndex = 0;

  const goToNextImage = () => {
    showIndex = Math.min(showIndex + 1, images.length - 1);
  };

  const goToPrevImage = () => {
    showIndex = Math.max(showIndex - 1, 0);
  };
</script>

<div class="images-and-buttons">
  <ObnoxiousButton
    onClick={goToPrevImage}
    label="Previous"
    direction="counter-clockwise"
    iconSrc="/arrow-left.png"
  />
  <div class="image-wrapper" data-testid="images-and-text-images">
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
    column-gap: 8px;
  }

  .image-wrapper {
    position: relative;
    width: 200px;
    height: 200px;
    overflow: hidden;
  }
</style>
