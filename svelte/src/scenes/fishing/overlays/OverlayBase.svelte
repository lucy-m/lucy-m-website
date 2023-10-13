<script lang="ts">
  export let width: "narrow" | "wide" = "narrow";
</script>

<div class={`wrapper ${width}`}>
  <slot />
</div>

<style>
  .wrapper {
    padding: 16px;
    max-width: calc(100vw - 48px);
    background-color: hsl(208, 100%, 97%);
  }

  .wrapper.narrow {
    width: 300px;
  }

  .wrapper.wide {
    width: 600px;
  }

  .wrapper :global(button) {
    cursor: pointer;
  }

  .wrapper :global(p) {
    margin-top: 0;
  }
</style>
