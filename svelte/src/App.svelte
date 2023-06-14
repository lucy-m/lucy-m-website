<script lang="ts">
  import { derived, writable } from "svelte/store";
  import { fallback, navItems } from "./routes";

  const staticItems = document.querySelectorAll("[data-static='true']");
  staticItems.forEach((item) => {
    item.setAttribute("style", "display: none");
  });

  const locationHashStore = writable<string>(
    window.location.hash.replace("#", "")
  );

  const navigateFn = (pathname: string) => () => {
    locationHashStore.set(pathname);
    window.location.hash = pathname;
  };

  const currentComponent = derived(locationHashStore, (hash) => {
    for (let navItem of navItems) {
      if (navItem !== fallback && hash.startsWith(navItem.route)) {
        return navItem;
      }
    }

    return fallback;
  });
</script>

<div class="button-bar">
  {#each navItems as { label, route, hidden }}
    {#if !hidden}
      <button on:click={navigateFn(route)}><span>{label}</span></button>
    {/if}
  {/each}
</div>

<svelte:component
  this={$currentComponent.component}
  {...$currentComponent.props}
/>

<style>
  .button-bar {
    width: 100%;
    background-color: hsl(140.91deg 49.83% 87.89%);
    box-shadow: var(--box-shadow);
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
