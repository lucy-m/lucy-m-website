<script lang="ts">
  import ObnoxiousButton from "./ObnoxiousButton.svelte";
  import SpringImage from "./SpringImage.svelte";

  export let images: { src: string; alt: string }[];
  export let text: string[];
  export let imageSize: number;

  let showIndex = 0;

  const padding = 12;

  const goToNextImage = () => {
    showIndex = Math.min(showIndex + 1, images.length - 1);
  };

  const goToPrevImage = () => {
    showIndex = Math.max(showIndex - 1, 0);
  };
</script>

<div class="images-and-text-wrapper">
  <div class="images-and-buttons" style:padding={`${padding}px 0px`}>
    <ObnoxiousButton
      onClick={goToPrevImage}
      label="Previous"
      direction="counter-clockwise"
      iconSrc="/arrow-left.png"
      disabled={showIndex <= 0}
    />
    <div
      class="image-wrapper"
      data-testid="images-and-text-images"
      style:height={imageSize + 2 * padding + "px"}
      style:width={imageSize + 2 * padding + "px"}
      style:margin={-padding + "px"}
    >
      {#each images as image, index}
        <SpringImage
          {image}
          myIndex={index}
          {showIndex}
          {padding}
          imageCount={images.length}
          containerSize={imageSize}
        />
      {/each}
    </div>
    <ObnoxiousButton
      onClick={goToNextImage}
      label="Next"
      direction="clockwise"
      iconSrc="/arrow-right.png"
      disabled={showIndex >= images.length - 1}
    />
  </div>

  {#each text as t}
    <p>{t}</p>
  {/each}
</div>

<style>
  .images-and-text-wrapper {
    display: flex;
    flex-direction: column;
    align-items: center;
  }

  p {
    width: 100%;
  }

  .images-and-buttons {
    display: flex;
    align-items: center;
    column-gap: 8px;
    margin-bottom: calc(var(--spacing) * 0.5);
  }

  .image-wrapper {
    position: relative;
    overflow: hidden;
  }
</style>
