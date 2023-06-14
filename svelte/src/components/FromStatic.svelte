<script lang="ts">
  export let selector: string;

  const contentElement = document.querySelector(selector);
  contentElement && contentElement.setAttribute("style", "display: none");

  let staticDiv: HTMLDivElement;

  $: {
    if (staticDiv) {
      staticDiv.innerHTML = contentElement?.innerHTML ?? "";
    }
  }
</script>

<div bind:this={staticDiv} />
