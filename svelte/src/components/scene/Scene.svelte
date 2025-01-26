<script lang="ts">
  import { map, Observable, startWith } from "rxjs";
  import seedrandom from "seedrandom";
  import type { ComponentType } from "svelte";
  import {
    loadImages,
    type SceneSpec,
    type SceneType,
    type SvelteComponentMounter,
  } from "../../model";
  import type { UserInteraction } from "../../model/user-interactions";
  import { viewScene } from "../../scenes/drawing";
  import { makeOverlayDisplay } from "./overlay-display";

  export let sceneSpec: SceneSpec;

  export let _testProps:
    | {
        seed?: string;
        onSceneChange?: (scene: SceneType) => void;
        userInteractions$?: Observable<UserInteraction>;
      }
    | undefined = undefined;

  let windowWidth = window.innerWidth;
  let windowHeight = window.innerHeight;

  const seed = _testProps?.seed ?? seedrandom().int32().toString();
  console.log("Congratulations! Your random seed is", seed);

  window.addEventListener("resize", () => {
    windowWidth = window.innerWidth;
    windowHeight = window.innerHeight;
  });

  const overlayDisplay = makeOverlayDisplay();
  const overlayDisplayState$ = overlayDisplay.state$;
  const worldDisabled$ = overlayDisplayState$.pipe(
    map((v) => v.worldDisabled),
    startWith(false)
  );

  const mountSvelteComponent: SvelteComponentMounter = (
    component: ComponentType,
    props: object
  ) => {
    overlayDisplay.show({ component, props });
  };

  const unmountSelf = () => {
    overlayDisplay.hide();
  };
</script>

{#if windowWidth <= 800}
  {#if windowHeight >= 800}
    <div class="item-wrapper" aria-hidden="true">
      If you're on mobile you should rotate your device! If not, make the window
      bigger or zoom out.
    </div>
  {/if}
{/if}

<div class="canvas-wrapper">
  {#await loadImages()}
    <div class="loading">
      <p>Loading</p>
      <p>.</p>
      <p>.</p>
      <p>.</p>
    </div>
  {:then images}
    <canvas
      class:disabled={$overlayDisplayState$.worldDisabled}
      style:filter={`blur(${2.5 * $overlayDisplayState$.inOutValue}px)`}
      use:viewScene={{
        initialSceneSpec: sceneSpec,
        images,
        seed,
        mountSvelteComponent,
        onSceneChange: _testProps?.onSceneChange,
        userInteractions$: _testProps?.userInteractions$,
        worldDisabled$,
      }}
    />
  {/await}
  <div
    class="overlay"
    class:disabled={!$overlayDisplayState$.worldDisabled}
    style:opacity={$overlayDisplayState$.inOutValue}
  >
    <div class="overlay-content-wrapper">
      {#if $overlayDisplayState$.overlayComponent}
        <svelte:component
          this={$overlayDisplayState$.overlayComponent.component}
          {...$overlayDisplayState$.overlayComponent.props}
          {unmountSelf}
        />
      {/if}
    </div>
  </div>
</div>

<style>
  .canvas-wrapper {
    position: relative;
    margin: auto;
    box-shadow: var(--box-shadow);
    background-color: white;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  canvas {
    width: 100%;
    max-height: 95vh;
    will-change: filter;
  }

  .overlay {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    will-change: opacity;
  }

  .disabled {
    pointer-events: none;
  }

  .overlay-content-wrapper {
    box-shadow:
      3px 3px 14px 4px hsla(0, 0%, 0%, 0.05),
      2px 2px 8px 3px hsla(0, 0%, 0%, 0.1),
      1px 1px 3px 1px hsla(0, 0%, 0%, 0.1);
    user-select: none;
  }

  .loading {
    font-size: 2rem;
    display: flex;
    align-items: baseline;
    padding: 48px 96px;
  }

  .loading p {
    margin-top: 0;
  }

  .loading > :nth-child(n + 2) {
    animation-name: hop;
    animation-duration: 1200ms;
    animation-iteration-count: infinite;
    animation-direction: alternate;
  }

  .loading > :nth-child(2) {
    animation-delay: 500ms;
  }

  .loading > :nth-child(3) {
    animation-delay: 650ms;
  }

  .loading > :nth-child(4) {
    animation-delay: 800ms;
  }

  @keyframes hop {
    85% {
      transform: translateY(0);
    }
    100% {
      transform: translateY(-0.5rem);
    }
  }
</style>
