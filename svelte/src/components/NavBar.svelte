<script lang="ts">
  import { derived } from "svelte/store";
  import { makeElementSizeStore } from "../model";
  import { navItems } from "../routes";

  export let navigateFn: (s: string) => () => void;

  let wrapperEl: HTMLElement | undefined;
  let open = false;

  $: containerSizeStore = wrapperEl && makeElementSizeStore(wrapperEl);
  $: derivedDisplay =
    containerSizeStore &&
    derived(containerSizeStore, (size) => {
      const collapseButtons = size.width < 500;

      return { collapseButtons };
    });
</script>

<div
  class="button-bar"
  class:collapsed={$derivedDisplay?.collapseButtons}
  class:open
  bind:this={wrapperEl}
>
  <button
    class="menu-toggle"
    on:click={() => {
      open = !open;
    }}>Menu</button
  >
  <div class="buttons-wrapper">
    {#each navItems as { label, route, hidden }}
      {#if !hidden}
        <button on:click={navigateFn(route)}><span>{label}</span></button>
      {/if}
    {/each}
  </div>
</div>

<style>
  .button-bar {
    width: 100%;
    background-color: hsl(140.91deg 49.83% 87.89%);
    box-shadow: var(--box-shadow);
  }

  .button-bar .buttons-wrapper {
    display: flex;
    width: 100%;
  }

  .button-bar .menu-toggle {
    display: none;
  }

  .button-bar.collapsed .menu-toggle {
    display: block;
    width: 100%;
  }

  .button-bar.collapsed .buttons-wrapper {
    flex-direction: column;
    display: none;
  }

  .button-bar.collapsed.open .buttons-wrapper {
    display: flex;
  }

  .button-bar button {
    padding: var(--spacing);
    outline: none;
    border: none;
    font-family: "Quicksand";
    font-size: max(min(1.2rem, 3vw), 1rem);
    background: transparent;
    cursor: pointer;
    transition: background 400ms;
  }

  .button-bar button:hover {
    background-color: hsl(139 62% 68% / 1);
  }

  .button-bar button > span {
    display: block;
    scale: 1;
    transition: scale 400ms;
  }

  .button-bar button:hover > span {
    animation-name: wiggle;
    animation-duration: 1000ms;
    animation-iteration-count: infinite;
    animation-timing-function: linear;
    scale: 1.1;
  }

  @keyframes wiggle {
    0% {
      rotate: 0;
    }
    25% {
      rotate: -4deg;
    }
    50% {
      rotate: 0;
    }
    75% {
      rotate: 4deg;
    }
    100% {
      rotate: 0;
    }
  }
</style>
