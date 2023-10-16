<script lang="ts">
  import { getDependencies, type TalentTree } from "./talents";

  export let talentTree: TalentTree;
  export let targetWidth: number;
  export let targetHeight: number;
  export let itemSize: number;
  export let itemGap: number;

  $: dependencies = getDependencies(talentTree);

  const getCenterX = (colIndex: number): number => {
    return itemSize / 2 + (itemSize + itemGap) * colIndex;
  };

  const getTopY = (rowIndex: number): number => {
    return (itemSize + itemGap) * rowIndex;
  };
</script>

<svg class="dependency-display" viewBox={`0 0 ${targetWidth} ${targetHeight}`}>
  {#each dependencies as dep}
    <path
      d={`M${getCenterX(dep.from.column)},${getTopY(dep.from.row)} v${
        -itemGap / 2
      } h${getCenterX(dep.to.column) - getCenterX(dep.from.column)} v${
        -itemGap / 2
      }`}
      stroke="black"
      fill="none"
    />
  {/each}
</svg>

<style>
  .dependency-display {
    width: 100%;
    height: 100%;
  }
</style>
