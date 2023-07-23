<script lang="ts">
  import { PosFns, makeNumberSpring, makePositionSpring } from "../../model";

  export let label: string;
  export let onClick: () => void;
  export let direction: "clockwise" | "counter-clockwise";
  export let iconSrc: string | undefined = undefined;

  const rotateSpring = makeNumberSpring({
    endPoint: 0,
    position: 0,
    velocity: 0,
    properties: {
      friction: 2.5,
      precision: 0.5,
      stiffness: 0.2,
      weight: 1.5,
    },
  });

  const offsetSpring = makePositionSpring({
    endPoint: PosFns.zero,
    position: PosFns.zero,
    velocity: PosFns.zero,
    properties: {
      friction: 4,
      precision: 0.5,
      stiffness: 1.5,
      weight: 0.2,
    },
  });

  const onClickAndRotate = () => {
    onClick();
    rotateSpring.update((s) => ({
      endPoint: direction === "clockwise" ? s.endPoint + 360 : s.endPoint - 360,
    }));
  };

  const onMouseMove = (e: MouseEvent) => {
    const centerOffset = PosFns.new(e.offsetX - 25, e.offsetY - 25);
    const target = PosFns.scale(centerOffset, -0.25);

    offsetSpring.set({ endPoint: target });
  };

  const onMouseLeave = () => {
    offsetSpring.set({ endPoint: PosFns.zero });
  };
</script>

<button
  on:click={onClickAndRotate}
  on:mousemove={onMouseMove}
  on:mouseleave={onMouseLeave}
  aria-label={label}
  style:rotate={$rotateSpring.position + "deg"}
>
  {#if iconSrc}
    <img
      src={iconSrc}
      alt=""
      style:left={$offsetSpring.position.x + "px"}
      style:top={$offsetSpring.position.y + "px"}
      style:rotate={-2 * $rotateSpring.position + "deg"}
    />
  {:else}
    {label}
  {/if}
</button>

<style>
  button {
    width: 50px;
    height: 50px;
    padding: 0;
    border: none;
    background-color: hsl(140.91deg 49.83% 87.89%);
    box-shadow: var(--box-shadow);
  }

  img {
    position: relative;
  }
</style>
