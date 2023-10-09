<script lang="ts">
  import { interval, scan, startWith } from "rxjs";
  import type { FishingSceneState } from "../fishing-scene-state";
  import OverlayBase from "./OverlayBase.svelte";

  export let unmountSelf: () => void;
  export let state: FishingSceneState | undefined;
  export let resetState: () => void;

  const countdown = interval(1000).pipe(
    scan((acc) => Math.max(0, acc - 1), 5),
    startWith(5)
  );
</script>

<OverlayBase>
  <div class="menu-wrapper" data-testid="game-menu-overlay">
    {#if state}
      <section>
        <p>Level {state.level}</p>
        <p>XP {state.levelXp}/{state.nextLevelXp}</p>
      </section>
    {:else}
      <section>You should try catching a fish...</section>
    {/if}
    <section>
      <button
        disabled={$countdown > 0}
        on:click={() => {
          resetState();
          unmountSelf();
        }}
        >Reset state {#if $countdown > 0}({$countdown}){/if}</button
      >
      <button on:click={unmountSelf}>Close</button>
    </section>
  </div>
</OverlayBase>

<style>
  .menu-wrapper {
    display: flex;
    flex-direction: column;
    row-gap: 32px;
  }

  p {
    margin: 0;
  }

  section {
    display: flex;
    flex-direction: column;
    row-gap: 16px;
  }
</style>
