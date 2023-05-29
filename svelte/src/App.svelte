<script lang="ts">
  import { writable } from "svelte/store";
  import { Scene } from "./components";
  import Canvas from "./components/Canvas.svelte";
  import { introScene } from "./scenes/intro-scene";

  const locationHashStore = writable<string>(
    window.location.hash.replace("#", "")
  );

  const foo = document.querySelector("#static-intro");
  foo && foo.setAttribute("style", "display: none");

  let staticDiv: HTMLDivElement;

  $: {
    if (staticDiv) {
      staticDiv.innerHTML = foo?.innerHTML ?? "";
    }
  }

  const navigate = (pathname: string) => {
    locationHashStore.set(pathname);
    window.location.hash = pathname;
  };
</script>

<div>
  <button on:click={() => navigate("/")}>Home</button>
  <button on:click={() => navigate("/the-fun-bit")}>See something fun</button>
  <button on:click={() => navigate("/canvas")}>Canvas</button>
</div>

{#if $locationHashStore.startsWith("/the-fun-bit")}
  <Scene source={introScene} />
{:else if $locationHashStore.startsWith("/canvas")}
  <Canvas />
{:else}
  <div bind:this={staticDiv} />
{/if}
