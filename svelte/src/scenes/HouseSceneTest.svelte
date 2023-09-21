<script lang="ts">
  export let unmountSelf: () => void;
  export let value: string;
</script>

<!-- svelte-ignore a11y-click-events-have-key-events -->
<div>
  <p>Thank you for clicking on the house</p>
  <p>The value is {value}</p>
  <button on:click={unmountSelf}>Close</button>
</div>

<style>
  div {
    padding: 16px;
    background-color: aliceblue;
    max-width: 300px;
    display: flex;
    flex-direction: column;
    row-gap: 16px;
  }

  button {
    cursor: pointer;
  }
</style>
