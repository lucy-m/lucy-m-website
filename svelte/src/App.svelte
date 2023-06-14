<script lang="ts">
  import { writable } from "svelte/store";
  import { Scene } from "./components";
  import FromStatic from "./components/FromStatic.svelte";
  import { routes } from "./routes";
  import { introScene } from "./scenes/intro-scene";

  const locationHashStore = writable<string>(
    window.location.hash.replace("#", "")
  );

  const navigateFn = (pathname: string) => () => {
    locationHashStore.set(pathname);
    window.location.hash = pathname;
  };

  interface NavButtons {
    route: string;
    label: string;
  }

  const navButtons: NavButtons[] = [
    {
      label: "Home",
      route: "/",
    },
    {
      label: "CV",
      route: routes.cv,
    },
    {
      label: "Something fun",
      route: routes.theFunBit,
    },
  ];
</script>

<div class="button-bar">
  {#each navButtons as { label, route }}
    <button on:click={navigateFn(route)}><span>{label}</span></button>
  {/each}
</div>

{#if $locationHashStore.startsWith(routes.theFunBit)}
  <Scene source={introScene} />
{:else if $locationHashStore.startsWith(routes.cv)}
  <FromStatic selector="#cv" />
{:else}
  <FromStatic selector="#static-intro" />
{/if}

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
    font-size: 1rem;
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
