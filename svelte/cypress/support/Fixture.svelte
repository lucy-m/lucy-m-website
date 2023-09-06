<script lang="ts">
  import type { FixtureOptions } from "./fixture-options";

  import type { ComponentType, SvelteComponentTyped } from "svelte";

  type T = $$Generic<Record<string, any>>;

  export let componentType: ComponentType<SvelteComponentTyped<T>>;
  export let props: T;

  export let fixtureOptions: FixtureOptions | undefined = undefined;
</script>

<div
  class="test-wrapper"
  style:width={fixtureOptions?.width ?? "400px"}
  style:box-sizing="content-box"
>
  <svelte:component this={componentType} {...props} />
</div>

<style>
  .test-wrapper {
    border: 1px solid black;
  }
</style>
