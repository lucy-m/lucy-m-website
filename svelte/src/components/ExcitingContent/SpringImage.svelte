<script lang="ts">
  import { spring } from "svelte/motion";

  export let image: { src: string; alt: string };
  export let myIndex: number;
  export let showIndex: number;
  export let onClick: () => void;

  const stackSize = 0.04;

  const calculateLocation = (myIndex: number, showIndex: number): number => {
    if (myIndex > showIndex) {
      return 1;
    } else {
      return stackSize * myIndex;
    }
  };

  const calculateBrightness = (myIndex: number, showIndex: number): number => {
    if (myIndex < showIndex) {
      return 0.5;
    } else {
      return 1;
    }
  };

  const locationSpring = spring(calculateLocation(myIndex, showIndex), {
    damping: 0.5,
    precision: 0.01,
    stiffness: 0.1,
  });

  const brightnessSpring = spring(calculateBrightness(myIndex, showIndex), {
    damping: 0.5,
    precision: 0.01,
    stiffness: 0.05,
  });

  $: {
    locationSpring.set(calculateLocation(myIndex, showIndex));
    brightnessSpring.set(calculateBrightness(myIndex, showIndex));
  }
</script>

<img
  src={image.src}
  alt={image.alt}
  style:left={$locationSpring * 100 + "%"}
  style:top={$locationSpring * 100 + "%"}
  style:filter="brightness({$brightnessSpring})"
  data-current={myIndex === showIndex}
  on:click={onClick}
  on:keydown={onClick}
/>

<style>
  img {
    position: absolute;
    top: 0;
    width: 88%;
    height: 88%;
    object-fit: cover;
  }
</style>
