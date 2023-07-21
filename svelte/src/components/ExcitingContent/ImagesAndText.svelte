<script lang="ts">
  import SpringImage from "./SpringImage.svelte";

  export let images: { src: string; alt: string }[];
  export let text: string[];

  let showIndex = 0;

  const goToNextImage = () => {
    showIndex = (showIndex + 1) % images.length;
  };
</script>

<div class="image-wrapper" data-testid="images-and-text">
  {#each images as image, index}
    <SpringImage
      {image}
      myIndex={index}
      {showIndex}
      imageCount={images.length}
      onClick={goToNextImage}
    />
  {/each}
</div>

{#each text as t}
  <p>{t}</p>
{/each}

<style>
  .image-wrapper {
    position: relative;
    width: 200px;
    height: 200px;
    overflow: hidden;
    border: 1px solid black;
  }
</style>
