<script lang="ts">
  import { Subject, map } from "rxjs";
  import { PosFns, type Position } from "../../model";
  import {
    makeNumberSpring,
    makePositionSpring,
    type SpringEvent,
  } from "../../model/spring-observable";

  export let image: { src: string; alt: string };
  export let myIndex: number;
  export let showIndex: number;
  export let imageCount: number;
  export let containerSize: number;
  export let padding: number;

  const stackSize = 4;
  $: imageSize = ((100 - stackSize * (imageCount - 1)) / 100) * containerSize;

  const calculateLocation = (myIndex: number, showIndex: number): Position => {
    if (myIndex > showIndex) {
      const location = PosFns.new(60, 110);
      return location;
    } else {
      const frac = stackSize * (myIndex + (imageCount - showIndex - 1) / 2);
      const location = PosFns.new(frac, frac);

      return location;
    }
  };

  const calculateBrightness = (myIndex: number, showIndex: number): number => {
    if (myIndex < showIndex) {
      return 0.5;
    } else {
      return 1;
    }
  };

  const showIndexChangedSub = new Subject<number>();
  $: showIndexChangedSub.next(showIndex);

  const locationSpring$ = makePositionSpring(
    {
      endPoint: calculateLocation(myIndex, showIndex),
      position: calculateLocation(myIndex, showIndex),
      velocity: PosFns.zero,
      properties: {
        friction: 5.5,
        stiffness: 0.2,
        weight: 0.15,
        precision: 0.1,
      },
    },
    showIndexChangedSub.pipe(
      map(
        (showIndex) =>
          ({
            kind: "set",
            set: { endPoint: calculateLocation(myIndex, showIndex) },
          } as SpringEvent<Position>)
      )
    )
  );

  const brightnessSpring$ = makeNumberSpring(
    {
      endPoint: calculateBrightness(myIndex, showIndex),
      position: calculateBrightness(myIndex, showIndex),
      velocity: 0,
      properties: {
        friction: 4,
        stiffness: 0.1,
        weight: 0.05,
        precision: 0.1,
      },
    },
    showIndexChangedSub.pipe(
      map(
        (showIndex) =>
          ({
            kind: "set",
            set: { endPoint: calculateBrightness(myIndex, showIndex) },
          } as SpringEvent<number>)
      )
    )
  );
</script>

<img
  src={image.src}
  alt={image.alt}
  style:left={($locationSpring$.position.x / 100) * containerSize +
    padding +
    "px"}
  style:top={($locationSpring$.position.y / 100) * containerSize +
    padding +
    "px"}
  style:filter="brightness({$brightnessSpring$.position})"
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
