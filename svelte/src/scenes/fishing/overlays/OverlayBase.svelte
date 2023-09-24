<script lang="ts">
</script>

<div class="wrapper">
  <slot />
</div>

<style>
  .wrapper {
    padding: 16px;
    background-color: aliceblue;
  }

  .wrapper :global(button) {
    cursor: pointer;
  }
</style>
