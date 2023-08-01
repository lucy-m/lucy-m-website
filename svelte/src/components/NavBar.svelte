<script lang="ts">
  import {
    Observable,
    Subject,
    combineLatest,
    distinctUntilChanged,
    map,
    scan,
  } from "rxjs";
  import { derived } from "svelte/store";
  import { makeElementSizeStore, observeElementSize } from "../model";
  import {
    makeNumberSpring$,
    type SpringEvent,
  } from "../model/spring-observable";
  import type { NavItem } from "../routes";

  export let navItems: Pick<NavItem, "label" | "route" | "hidden">[];
  export let navigateFn: (s: string) => void;

  let wrapperEl: HTMLElement | undefined;
  let buttonWrapperEl: HTMLElement | undefined;

  const openSub = new Subject<void>();
  const open$ = openSub.pipe(scan((open) => !open, false));

  $: containerSizeStore = wrapperEl && makeElementSizeStore(wrapperEl);

  $: derivedDisplay =
    containerSizeStore &&
    derived(containerSizeStore, (containerSize) => {
      const collapseButtons = containerSize.clientWidth < 500;

      return {
        collapseButtons,
      };
    });

  $: heightSpring$ = (() => {
    if (!buttonWrapperEl) {
      return undefined;
    } else {
      const height$ = observeElementSize(buttonWrapperEl).pipe(
        map((v) => v.scrollHeight),
        distinctUntilChanged()
      );

      const events$: Observable<SpringEvent<number>> = combineLatest([
        open$,
        height$,
      ]).pipe(
        map(([open, height]) => ({
          kind: "set",
          set: { endPoint: open ? height : 0 },
        }))
      );

      return makeNumberSpring$(
        {
          endPoint: 0,
          position: 0,
          velocity: 0,
          properties: {
            friction: 2.1,
            precision: 0.1,
            stiffness: 0.4,
            weight: 0.1,
          },
        },
        events$
      );
    }
  })();

  const onClick = (route: string) => () => {
    openSub.next();
    navigateFn(route);
  };
</script>

<div
  class="button-bar"
  class:collapsed={$derivedDisplay?.collapseButtons}
  class:open={$open$}
  bind:this={wrapperEl}
>
  <button
    class="menu-toggle"
    on:click={() => {
      openSub.next();
    }}><span>Menu</span></button
  >
  <div class="buttons-wrapper" style:height={$heightSpring$?.position + "px"}>
    <div bind:this={buttonWrapperEl}>
      {#each navItems as { label, route, hidden }}
        {#if !hidden}
          <button on:click={onClick(route)}><span>{label}</span></button>
        {/if}
      {/each}
    </div>
  </div>
</div>

<style>
  .button-bar {
    width: 100%;
    background-color: hsl(140.91deg 49.83% 87.89%);
    box-shadow: var(--box-shadow);
    position: relative;
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
    height: 0px;
    overflow: hidden;
    position: absolute;
    top: calc(100% + var(--spacing-05));
    left: var(--spacing);
    right: var(--spacing);
    width: auto;
    background-color: hsl(140.91deg 49.83% 87.89%);
  }

  .button-bar.collapsed.open .buttons-wrapper {
    box-shadow: var(--box-shadow);
  }

  .button-bar.collapsed .buttons-wrapper > div {
    display: flex;
    flex-direction: column;
    height: min-content;
    width: 100%;
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
