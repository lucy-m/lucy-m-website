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
      <div class="loading-container">
        <img src={fishData.backgroundSrc} alt="" />
      </div>
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

  .loading-container {
    position: relative;
    width: 100%;
    padding-top: 100%;
    background: hsl(210, 12%, 96%);
    background-image: linear-gradient(
      to right,
      hsl(210, 12%, 96%) 0%,
      hsl(225, 12%, 94%) 20%,
      hsl(210, 12%, 96%) 40%,
      hsl(210, 12%, 96%) 100%
    );
    background-size: 800px 100px;
    animation-name: shimmer;
    animation-duration: 1s;
    animation-delay: 1s;
    animation-iteration-count: infinite;
  }

  @keyframes shimmer {
    0% {
      background-position: -300px 0;
    }

    100% {
      background-position: 300px 0;
    }
  }

  img {
    width: 100%;
    position: absolute;
    top: 0;
  }

  .fish-name {
    font-size: 1.5rem;
    font-family: "Bitter";
    letter-spacing: -1px;
  }
</style>
