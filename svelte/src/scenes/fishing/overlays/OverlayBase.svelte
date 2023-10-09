<script lang="ts">
</script>

<div class="wrapper">
  <slot />
</div>

<style>
  .wrapper {
    padding: 16px;
    width: 300px;
    background-color: aliceblue;
  }

  .wrapper :global(button) {
    cursor: pointer;
  }

  .wrapper :global(p) {
    margin-top: 0;
  }
</style>
