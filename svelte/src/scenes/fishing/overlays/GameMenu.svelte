<script lang="ts">
  import type { FishingSceneState } from "../fishing-scene-state";
  import OverlayBase from "./OverlayBase.svelte";

  export let unmountSelf: () => void;
  export let state: FishingSceneState | undefined;
</script>

<OverlayBase>
  <div class="menu-wrapper" data-testid="game-menu-overlay">
    {#if state}
      <div>
        <p>Level {state.level}</p>
        <p>XP {state.levelXp}/{state.nextLevelXp}</p>
      </div>
    {/if}
    <button on:click={unmountSelf}>Close</button>
  </div>
</OverlayBase>

<style>
  .menu-wrapper {
    display: flex;
    flex-direction: column;
    width: 300px;
    row-gap: 32px;
  }
</style>
