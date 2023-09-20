<script lang="ts">
  export let unmountSelf: () => void;
</script>

<div on:click={unmountSelf}>House scene test div</div>

<style>
  div {
    padding: 16px;
    background-color: aliceblue;
  }
</style>
