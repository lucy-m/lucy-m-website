<script lang="ts">
  import { writable } from "svelte/store";
  import { Scene } from "./components";
  import FromStatic from "./components/FromStatic.svelte";
  import { introScene } from "./scenes/intro-scene";

  const locationHashStore = writable<string>(
    window.location.hash.replace("#", "")
  );
  const navigate = (pathname: string) => {
    locationHashStore.set(pathname);
    window.location.hash = pathname;
  };
</script>

<div class="button-bar">
  <button on:click={() => navigate("/")}> <span>Home</span></button>
  <button on:click={() => navigate("/the-fun-bit")}>
    <span>Something fun</span></button
  >
</div>

{#if $locationHashStore.startsWith("/the-fun-bit")}
  <Scene source={introScene} />
{:else}
  <FromStatic selector="#static-intro" />
  <FromStatic selector="#cv" />
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
