<script lang="ts">
  import type { ComponentType, SvelteComponentTyped } from "svelte";

  type T = $$Generic<Record<string, any>>;

  export let componentType: ComponentType<SvelteComponentTyped<T>>;
  export let props: T;

  export let fixtureOptions:
    | Partial<{
        width: string;
      }>
    | undefined = undefined;
</script>

<div class="test-wrapper" style:width={fixtureOptions?.width ?? "400px"}>
  <svelte:component this={componentType} {...props} />
</div>

<style>
  .test-wrapper {
    border: 1px solid black;
  }
</style>
