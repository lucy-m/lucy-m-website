<script lang="ts">
  import OverlayBase from "./OverlayBase.svelte";

  export let unmountSelf: () => void;
</script>

<!-- svelte-ignore a11y-click-events-have-key-events -->
<OverlayBase>
  <div class="content">
    <div data-testid="fish-caught-notification">
      <p>Congratulations!</p>
      <p>You caught your first fish! Keep going and soon you will level up!</p>
    </div>
    <button on:click={unmountSelf}>OK</button>
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
