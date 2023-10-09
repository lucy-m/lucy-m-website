<script lang="ts">
  import type { FishName } from "../../../model";
  import OverlayBase from "./OverlayBase.svelte";

  export let unmountSelf: () => void;
  export let fishType: FishName;
</script>

<OverlayBase>
  <div class="content" data-testid="new-fish-caught-overlay">
    <p>You caught a new fish {fishType}</p>
    <button on:click={unmountSelf}>Cool!</button>
  </div>
</OverlayBase>

<style>
  .content {
    max-width: 300px;
    display: flex;
    flex-direction: column;
    row-gap: 32px;
  }
</style>
