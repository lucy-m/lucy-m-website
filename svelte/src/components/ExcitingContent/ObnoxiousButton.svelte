<script lang="ts">
  import { PosFns, makeNumberSpring, makePositionSpring } from "../../model";

  export let label: string;
  export let onClick: () => void;
  export let direction: "clockwise" | "counter-clockwise";
  export let iconSrc: string | undefined = undefined;
  export let disabled: boolean;

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
      stiffness: 1,
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
  {disabled}
>
  {#if iconSrc}
    <img
      src={iconSrc}
      alt=""
      style:left={$offsetSpring.position.x + "px"}
      style:top={$offsetSpring.position.y + "px"}
      style:rotate={-2 * $rotateSpring.position + "deg"}
    />
    <img src={iconSrc} alt="" />
  {:else}
    {label}
  {/if}
</button>

<style>
  button {
    width: 50px;
    height: 50px;
    flex-shrink: 0;
    padding: 0;
    border: none;
    background-color: hsl(140.91deg 49.83% 87.89%);
    box-shadow: var(--box-shadow);
    cursor: pointer;
    position: relative;
    transition: filter 400ms;
  }

  button[disabled] {
    filter: saturate(0);
    cursor: default;
  }

  button:focus-visible {
    outline-color: hsl(120deg 73.25% 30.78%);
  }

  img {
    position: absolute;
    top: 0;
    left: 0;
    filter: hue-rotate(140.91deg) saturate(0.8) brightness(1.2);
  }

  img:nth-child(2) {
    opacity: 0.2;
  }
</style>
