<script lang="ts">
  import OverlayBase from "./OverlayBase.svelte";

  export let unmountSelf: () => void;
</script>

<!-- svelte-ignore a11y-click-events-have-key-events -->
<OverlayBase>
  <div class="content">
    <div data-testid="first-fish-overlay">
      <p>Congratulations!</p>
      <p>You caught your first fish! Keep going and soon you will level up!</p>
    </div>
    <button on:click={unmountSelf}>OK</button>
  </div>
</OverlayBase>

<style>
  .content {
    display: flex;
    flex-direction: column;
    row-gap: 32px;
  }
</style>
