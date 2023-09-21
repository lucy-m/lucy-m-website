<script lang="ts">
  export let unmountSelf: () => void;
  export let fishId: string;
</script>

<!-- svelte-ignore a11y-click-events-have-key-events -->
<div class="wrapper">
  <div>
    <p>Congratulations!</p>
    <p>You caught fish {fishId}!</p>
  </div>
  <button on:click={unmountSelf}>OK</button>
</div>

<style>
  .wrapper {
    padding: 16px;
    background-color: aliceblue;
    max-width: 300px;
    display: flex;
    flex-direction: column;
    row-gap: 32px;
  }

  button {
    cursor: pointer;
  }
</style>
