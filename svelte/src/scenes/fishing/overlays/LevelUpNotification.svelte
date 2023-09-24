<script lang="ts">
  import OverlayBase from "./OverlayBase.svelte";

  export let unmountSelf: () => void;
  export let newLevel: number;
  export let onClosed: () => void;

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
    <button on:click={onOkClick}>OK</button>
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
