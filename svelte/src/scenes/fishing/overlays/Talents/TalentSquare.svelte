<script lang="ts">
  import type { AssetKey } from "../../../../model";
  import { getTalentInfo, type TalentId } from "./talents";

  export let images: Record<AssetKey, ImageBitmap>;
  export let talentId: TalentId;
  export let xIndex: number;
  export let yIndex: number;
  export let selected: boolean;
  export let setSelected: () => void;
  export let clearSelected: () => void;

  const talentInfo = getTalentInfo(talentId);

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

<canvas
  use:drawImage={{ assetKey: talentInfo.image }}
  class="talent-tree-item"
  class:selected
  style:grid-column={xIndex + 1}
  style:grid-row={yIndex + 1}
  on:click={() => {
    if (selected) {
      clearSelected();
    } else {
      setSelected();
    }
  }}
/>

<style>
  .talent-tree-item {
    width: 100%;
    height: 100%;
  }

  .talent-tree-item.selected {
    outline: 8px solid hsl(273deg 47% 55%);
  }
</style>
