<script lang="ts">
  import { getFishData } from "../fish-data";
  import OverlayBase from "./OverlayBase.svelte";

  export let unmountSelf: () => void;
  export let fishType: string;

  const fishData = getFishData(fishType);
</script>

<OverlayBase>
  <div class="content" data-testid="new-fish-caught-overlay">
    <p>You caught a new fish!</p>
    <div class="fish-display">
      <p class="fish-name">{fishData.displayName}</p>
      <img src={fishData.backgroundSrc} alt="" />
    </div>
    <button on:click={unmountSelf}>Cool!</button>
  </div>
</OverlayBase>

<style>
  .content {
    display: flex;
    flex-direction: column;
    row-gap: 24px;
  }

  img {
    width: 100%;
  }

  .fish-name {
    font-size: 1.5rem;
    font-family: "Bitter";
    letter-spacing: -1px;
  }
</style>
