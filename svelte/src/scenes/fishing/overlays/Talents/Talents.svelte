<script lang="ts">
  import { observeElementSize, type AssetKey } from "../../../../model";
  import { recordToEntries } from "../../../../utils";
  import OverlayBase from "../OverlayBase.svelte";
  import { talentTree, type Talent } from "./talents";

  export let images: Record<AssetKey, ImageBitmap>;

  let wrapperEl: HTMLElement | undefined;

  let selected: { talent: Talent; xIndex: number; yIndex: number } | undefined;

  $: isSelected = (x: number, y: number): boolean => {
    if (selected) {
      return selected.xIndex === x && selected.yIndex === y;
    } else {
      return false;
    }
  };

  $: wrapperSize = wrapperEl && observeElementSize(wrapperEl);

  const itemSize = 100;
  const itemGap = 48;
  const talentTreeWidth = 3;
  const targetWidth =
    itemSize * talentTreeWidth + itemGap * (talentTreeWidth - 1);
  const targetHeight =
    itemSize * talentTree.length + itemGap * (talentTree.length - 1);

  const styleVariables = (wrapperWidth: number) => {
    const scale = wrapperWidth / targetWidth;

    const items = {
      "--talent-tree-height": talentTree.length,
      "--item-size": itemSize + "px",
      "--item-gap": itemGap + "px",
      "--talent-tree-width": talentTreeWidth,
      "--scale": scale,
      "--height": targetHeight * scale + "px",
    };

    const asString = recordToEntries(items)
      .map(([key, value]) => key + ": " + value)
      .join("; ");

    return asString;
  };

  const drawImage = (
    canvas: HTMLCanvasElement,
    args: { assetKey: AssetKey }
  ) => {
    canvas.width = 100;
    canvas.height = 100;

    const ctx = canvas.getContext("2d");

    if (!ctx) {
      throw new Error("Could not get canvas context");
    } else {
      const image = images[args.assetKey];
      ctx.drawImage(image, 0, 0);
    }
  };
</script>

<OverlayBase width="wide">
  <div class="wrapper">
    <div class="talent-tree-wrapper" bind:this={wrapperEl}>
      {#if $wrapperSize}
        <div
          class="talent-tree-styles-wrapper"
          style={styleVariables($wrapperSize.clientWidth)}
        >
          <div class="talent-tree-viewer">
            {#each talentTree as talentTreeRow, yIndex}
              {#each talentTreeRow as talent, xIndex}
                {#if talent !== undefined}
                  <canvas
                    use:drawImage={{ assetKey: talent.image }}
                    class="talent-tree-item"
                    class:selected={isSelected(xIndex, yIndex)}
                    style:grid-column={xIndex + 1}
                    style:grid-row={yIndex + 1}
                    on:click={() => {
                      if (isSelected(xIndex, yIndex) || !talent) {
                        selected = undefined;
                      } else {
                        selected = { talent, xIndex, yIndex };
                      }
                    }}
                  />
                {/if}
              {/each}
            {/each}
          </div>
        </div>
      {/if}
    </div>
    <div>
      {#if selected}
        {selected.talent.name}
      {:else}
        Selected talent will appear here
      {/if}
    </div>
  </div>
</OverlayBase>

<style>
  .wrapper {
    display: grid;
    grid-template-columns: 3fr 2fr;
    column-gap: 16px;
    max-height: calc(100vh - 24px);
  }

  .talent-tree-wrapper {
    position: relative;
    height: 100%;
    width: 100%;
  }

  .talent-tree-styles-wrapper {
    height: var(--height);
  }

  .talent-tree-viewer {
    position: absolute;
    display: grid;
    grid-template-columns: repeat(var(--talent-tree-width), var(--item-size));
    grid-template-rows: repeat(var(--talent-tree-height), var(--item-size));
    grid-gap: var(--item-gap);

    scale: var(--scale);
    transform-origin: top left;
  }

  .talent-tree-item {
    width: 100%;
    height: 100%;
  }

  .talent-tree-item.selected {
    outline: 8px solid hsl(273deg 47% 55%);
  }
</style>
