<script lang="ts">
  export let width: "narrow" | "wide" = "narrow";
</script>

<div class={`wrapper ${width}`}>
  <slot />
</div>

<style>
  .wrapper {
    --overlay-padding: 16px;
    --overlay-background: hsl(208, 100%, 97%);
    --overlay-background-dark: hsl(208, 30%, 85%);

    padding: var(--overlay-padding);
    max-width: calc(100vw - 48px);
    background-color: var(--overlay-background);
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
