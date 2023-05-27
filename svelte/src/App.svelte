<script lang="ts">
  import { writable } from "svelte/store";
  import { Scene } from "./components";
  import { introScene } from "./scenes/intro-scene";

  const pathnameStore = writable<string>(window.location.pathname);

  const foo = document.querySelector("#foo");
  const html = (foo?.innerHTML ?? "Unknown").replace("HTML", "Svelte");

  foo && foo.setAttribute("style", "display: none");

  let testDiv: HTMLDivElement;

  $: {
    if (testDiv) {
      testDiv.innerHTML = html;
    }
  }

  const navigate = (pathname: string) => {
    window.history.pushState("", "", pathname);
    pathnameStore.set(window.location.pathname);
  };
</script>

{#if $pathnameStore === "/the-fun-bit"}
  <button on:click={() => navigate("/")}>Home</button>
  <Scene source={introScene} />
{:else}
  <div bind:this={testDiv} />
  <button on:click={() => navigate("/the-fun-bit")}>Go to scene</button>
{/if}
