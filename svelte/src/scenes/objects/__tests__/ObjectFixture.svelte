<script lang="ts">
  import { Subject, Subscription, type Observable } from "rxjs";
  import type { PRNG } from "seedrandom";
  import seedrandom from "seedrandom";
  import {
    loadImages,
    type Destroyable,
    type Position,
    type SceneObject,
    type SceneType,
  } from "../../../model";
  import { viewScene } from "../../../scenes/drawing/view-scene";
  import { sceneSize } from "../../scene-size";

  export let makeObject: (random: PRNG) => SceneObject<string, unknown>;
  export let seed: string;
  export let onSceneChange:
    | ((scene: SceneType<string, unknown>) => void)
    | undefined = undefined;
  export let worldClick$: Observable<Position> | undefined = undefined;
  export let debugDraw$:
    | Observable<(ctx: CanvasRenderingContext2D) => void>
    | undefined = undefined;

  $: makeScene = (random: PRNG): SceneType<string, unknown> => {
    const object = makeObject(random);

    return {
      objects: [object],
      events: new Subject(),
      layerOrder: [object.layerKey],
      typeName: "object-test-scene",
    };
  };

  const debugOverlay = (canvas: HTMLCanvasElement): Destroyable => {
    let subscription: Subscription | undefined;

    canvas.width = sceneSize.x;
    canvas.height = sceneSize.y;

    const ctx = canvas.getContext("2d");

    if (ctx) {
      ctx.font = "24px Quicksand";
      ctx.fillText("debug overlay", 0, 24);

      subscription = debugDraw$?.subscribe((command) => {
        command(ctx);
      });
    }

    return {
      destroy: () => {
        subscription?.unsubscribe();
      },
    };
  };
</script>

<div class="wrapper">
  {#await loadImages() then images}
    <canvas
      class="view-canvas"
      use:viewScene={{
        initialScene: makeScene(seedrandom(seed)),
        images,
        onSceneChange,
        worldClick$,
      }}
    />
    <canvas class="debug-canvas" use:debugOverlay />
  {/await}
</div>

<style>
  .wrapper {
    width: 100%;
    position: relative;
  }

  canvas {
    width: 100%;
  }

  .view-canvas {
    background-color: white;
  }

  .debug-canvas {
    border: 2px solid mediumaquamarine;
    position: absolute;
    top: 0;
    left: 0;
  }
</style>
