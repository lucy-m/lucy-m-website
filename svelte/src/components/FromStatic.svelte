<script lang="ts">
  export let selector: string;

  $: contentElement = document.querySelector(selector);

  let staticDiv: HTMLDivElement;

  $: {
    if (staticDiv) {
      staticDiv.innerHTML = contentElement?.innerHTML ?? "";
    }
  }
</script>

<div bind:this={staticDiv} />
