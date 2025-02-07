<script lang="ts">
  import { derived, writable } from "svelte/store";
  import { NavBar } from "./components";
  import { fallback, navItems } from "./routes";

  const locationHashStore = writable<string>(
    window.location.hash.replace("#", "")
  );

  const navigateFn = (pathname: string) => {
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

  document
    .querySelector("#javascript-loading")
    ?.setAttribute("style", "display: none");
</script>

<NavBar {navItems} {navigateFn} />

<svelte:component
  this={$currentComponent.component}
  {...$currentComponent.props}
/>
