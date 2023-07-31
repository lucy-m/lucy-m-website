<script lang="ts">
  import { PosFns } from "../../model";
  import type { PositionSpring } from "../../model/spring";
  import {
    makeNumberSpring,
    makePositionSpring,
  } from "../../model/spring-store";

  export let image: { src: string; alt: string };
  export let myIndex: number;
  export let showIndex: number;
  export let imageCount: number;
  export let containerSize: number;
  export let padding: number;

  const stackSize = 4;
  $: imageSize = ((100 - stackSize * (imageCount - 1)) / 100) * containerSize;

  const calculateLocation = (
    myIndex: number,
    showIndex: number
  ): Partial<PositionSpring> => {
    if (myIndex > showIndex) {
      const endPoint = PosFns.new(60, 110);
      return { endPoint };
    } else {
      const location = stackSize * (myIndex + (imageCount - showIndex - 1) / 2);
      const endPoint = PosFns.new(location, location);

      return { endPoint };
    }
  };

  const calculateBrightness = (myIndex: number, showIndex: number): number => {
    if (myIndex < showIndex) {
      return 0.5;
    } else {
      return 1;
    }
  };

  const locationSpring = makePositionSpring({
    endPoint: PosFns.zero,
    position: PosFns.new(100, 100),
    velocity: PosFns.zero,
    properties: {
      friction: 5.5,
      stiffness: 0.9,
      weight: 1,
      precision: 0.1,
    },
  });

  const brightnessSpring = makeNumberSpring({
    endPoint: 1,
    position: 0,
    velocity: 0,
    properties: {
      friction: 0.5,
      stiffness: 0.05,
      weight: 1,
      precision: 0.1,
    },
  });

  $: {
    locationSpring.set(calculateLocation(myIndex, showIndex));
    brightnessSpring.set({ endPoint: calculateBrightness(myIndex, showIndex) });
  }
</script>

<img
  src={image.src}
  alt={image.alt}
  style:left={($locationSpring.position.x / 100) * containerSize +
    padding +
    "px"}
  style:top={($locationSpring.position.y / 100) * containerSize +
    padding +
    "px"}
  style:filter="brightness({$brightnessSpring.position})"
  style:height={imageSize + "px"}
  style:width={imageSize + "px"}
  data-current={myIndex === showIndex}
/>

<style>
  img {
    position: absolute;
    top: 0;
    object-fit: cover;
    box-shadow: var(--box-shadow);
  }
</style>
