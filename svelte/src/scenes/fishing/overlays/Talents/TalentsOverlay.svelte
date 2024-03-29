<script lang="ts">
  import { observeElementSize, type AssetKey } from "../../../../model";
  import { recordToEntries } from "../../../../utils";
  import OverlayBase from "../OverlayBase.svelte";
  import DependencyGraph from "./DependencyGraph.svelte";
  import TalentViewer from "./TalentDetails.svelte";
  import TalentSquare from "./TalentSquare.svelte";
  import {
    getDependencies,
    getTalentDependentsSatisfied,
    talentTree,
    type TalentId,
  } from "./talents";

  export let unmountSelf: () => void;
  export let onClosed: (talents: readonly TalentId[]) => void;

  export let images: Record<AssetKey, ImageBitmap>;
  export let learned: readonly TalentId[];
  export let totalTalentPoints: number;

  let wrapperEl: HTMLElement | undefined;
  let selected: { talent: TalentId; row: number; column: number } | undefined;

  $: wrapperSize = wrapperEl && observeElementSize(wrapperEl);

  const onLearnTalent = (talentId: TalentId) => {
    learned = [...learned, talentId];
  };

  const dependencies = getDependencies(talentTree);

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
  <div class="wrapper" data-testid="talents-overlay">
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
                    learned={learned.includes(talent.id)}
                    selected={selected?.talent === talent.id}
                    setSelected={() => {
                      if (talent) {
                        selected = {
                          talent: talent.id,
                          row: yIndex,
                          column: xIndex,
                        };
                      }
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
        <TalentViewer
          talentId={selected.talent}
          learned={learned.includes(selected.talent)}
          pointsAvailable={totalTalentPoints - learned.length}
          dependentsSatisfied={getTalentDependentsSatisfied(
            selected,
            dependencies,
            learned
          )}
          onLearn={(
            (talentId) => () =>
              onLearnTalent(talentId)
          )(selected.talent)}
        />
      {:else}
        Selected talent will appear here
      {/if}
    </div>
    <div class="footer">
      <div>{learned.length}/{totalTalentPoints} points spent</div>
      <button
        on:click={() => {
          onClosed(learned);
          unmountSelf();
        }}>Close</button
      >
    </div>
  </div>
</OverlayBase>

<style>
  .wrapper {
    display: grid;
    grid-template-columns: 3fr 2fr;
    grid-template-rows: 1fr auto;
    column-gap: calc(var(--overlay-padding) * 2);
    row-gap: calc(var(--overlay-padding) * 2);
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
    grid-column: 2;
    grid-row: 1 / span 2;
  }

  .footer {
    display: flex;
    justify-content: space-between;
  }
</style>
