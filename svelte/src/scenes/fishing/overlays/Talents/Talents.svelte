<script lang="ts">
  import { observeElementSize, type AssetKey } from "../../../../model";
  import { recordToEntries } from "../../../../utils";
  import OverlayBase from "../OverlayBase.svelte";
  import { talentTree } from "./talents";

  export let images: Record<AssetKey, ImageBitmap>;

  let wrapperEl: HTMLElement | undefined;

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
              {#each talentTreeRow as item, xIndex}
                {#if item !== undefined}
                  <div
                    class="talent-tree-item"
                    style:grid-column={xIndex + 1}
                    style:grid-row={yIndex + 1}
                  />
                {/if}
              {/each}
            {/each}
          </div>
        </div>
      {/if}
    </div>
    <div>Preview pane</div>
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
    border: 1px solid black;
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
    background-color: bisque;
  }
</style>
