<script lang="ts">
  import { interval, map, startWith, tap } from "rxjs";
  import OverlayBase from "./OverlayBase.svelte";

  export let unmountSelf: () => void;
  export let newLevel: number;
  export let onClosed: () => void;

  const timeRemaining = interval(1000).pipe(
    map((i) => 9 - i),
    startWith(10),
    tap((i) => {
      if (i === 0) {
        unmountSelf();
      }
    })
  );

  const onOkClick = () => {
    onClosed();
    unmountSelf();
  };
</script>

<!-- svelte-ignore a11y-click-events-have-key-events -->
<OverlayBase>
  <div class="content">
    <div data-testid="level-up-notification">
      <p>Wow! You are now level {newLevel}</p>
    </div>
    <button on:click={onOkClick}>OK ({$timeRemaining})</button>
  </div>
</OverlayBase>

<style>
  .content {
    display: flex;
    flex-direction: column;
    row-gap: 32px;
  }
</style>
