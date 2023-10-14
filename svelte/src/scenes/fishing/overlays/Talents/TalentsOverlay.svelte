<script lang="ts">
  import { observeElementSize, type AssetKey } from "../../../../model";
  import { recordToEntries } from "../../../../utils";
  import OverlayBase from "../OverlayBase.svelte";
  import DependencyGraph from "./DependencyGraph.svelte";
  import TalentSquare from "./TalentSquare.svelte";
  import TalentViewer from "./TalentViewer.svelte";
  import { talentTree, type TalentId } from "./talents";

  export let images: Record<AssetKey, ImageBitmap>;

  let wrapperEl: HTMLElement | undefined;

  let selected: TalentId | undefined;

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
          <div class="dependency-wrapper">
            <DependencyGraph
              {talentTree}
              {targetHeight}
              {targetWidth}
              {itemSize}
              {itemGap}
            />
          </div>
          <div class="talent-tree-viewer">
            {#each talentTree as talentTreeRow, yIndex}
              {#each talentTreeRow as talent, xIndex}
                {#if talent !== undefined}
                  <TalentSquare
                    {images}
                    talentId={talent.id}
                    {xIndex}
                    {yIndex}
                    selected={selected === talent.id}
                    setSelected={() => {
                      selected = talent?.id;
                    }}
                    clearSelected={() => {
                      selected = undefined;
                    }}
                  />
                {/if}
              {/each}
            {/each}
          </div>
        </div>
      {/if}
    </div>
    <div class="side-panel">
      {#if selected}
        <TalentViewer talentId={selected} />
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
    column-gap: calc(var(--overlay-padding) * 2);
    max-height: calc(100vh - 24px);
    min-height: 300px;
  }

  .talent-tree-wrapper {
    position: relative;
    height: 100%;
    width: 100%;
  }

  .talent-tree-styles-wrapper {
    height: var(--height);
  }

  .dependency-wrapper {
    position: absolute;
    top: 0;
    width: 100%;
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

  .side-panel {
    background-color: var(--overlay-background-dark);
    margin: calc(var(--overlay-padding) * -1);
    padding: var(--overlay-padding);
  }
</style>
