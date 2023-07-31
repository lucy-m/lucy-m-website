<script lang="ts">
  import { derived } from "svelte/store";
  import { makeElementSizeStore } from "../../model";
  import ObnoxiousButton from "./ObnoxiousButton.svelte";
  import SpringImage from "./SpringImage.svelte";

  export let images: { src: string; alt: string }[];
  export let text: string[];
  export let targetImageSize: number;

  let showIndex = 0;
  let wrapperEl: HTMLElement | undefined;

  const padding = 12;

  $: elementSizeStore = wrapperEl && makeElementSizeStore(wrapperEl);
  $: resolvedDisplay =
    elementSizeStore &&
    derived(elementSizeStore, (wrapperSize) => {
      const imageSize = Math.min(
        wrapperSize.width - padding * 4,
        targetImageSize
      );
      const imageWrapperSize = imageSize + padding * 2;
      const stackButtons = imageWrapperSize > wrapperSize.width - 110;

      return {
        imageSize,
        imageWrapperSize,
        stackButtons,
      };
    });

  const goToNextImage = () => {
    showIndex = Math.min(showIndex + 1, images.length - 1);
  };

  const goToPrevImage = () => {
    showIndex = Math.max(showIndex - 1, 0);
  };
</script>

<div class="images-and-text-wrapper" bind:this={wrapperEl}>
  <div
    class="images-and-buttons"
    class:stack-buttons={$resolvedDisplay?.stackButtons}
    style:padding={`${padding}px 0px`}
    style:column-gap={padding + 8 + "px"}
  >
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
      style:height={$resolvedDisplay?.imageWrapperSize + "px"}
      style:width={$resolvedDisplay?.imageWrapperSize + "px"}
      style:margin={-padding + "px"}
    >
      {#each images as image, index}
        <SpringImage
          {image}
          myIndex={index}
          {showIndex}
          {padding}
          imageCount={images.length}
          containerSize={$resolvedDisplay?.imageSize ?? targetImageSize}
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
    <p>{@html t}</p>
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
    margin-bottom: calc(var(--spacing) * 0.5);
  }

  .image-wrapper {
    position: relative;
    overflow: hidden;
  }

  .stack-buttons {
    flex-wrap: wrap;
    justify-content: center;
    row-gap: calc(var(--spacing) * 0.5);
  }

  .stack-buttons .image-wrapper {
    order: 1;
  }

  .stack-buttons :global(button) {
    order: 2;
  }
</style>
