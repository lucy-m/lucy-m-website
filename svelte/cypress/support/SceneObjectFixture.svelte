<script lang="ts">
  import {
    BehaviorSubject,
    Subject,
    Subscription,
    merge,
    type Observable,
  } from "rxjs";
  import type { PRNG } from "seedrandom";
  import {
    loadImages,
    makeSceneType,
    type Destroyable,
    type Position,
    type SceneObject,
    type SceneSpec,
    type SceneType,
  } from "../../src/model";
  import { sceneSize } from "../../src/scenes";
  import { viewScene } from "../../src/scenes/drawing/view-scene";
  import { choose } from "../../src/utils";

  export let makeObjects: (random: PRNG) => SceneObject[];
  export let seed: string;
  export let onSceneChange: ((scene: SceneType) => void) | undefined =
    undefined;
  export let layerOrder: readonly string[] | undefined = undefined;
  export let worldClick$: Observable<Position> | undefined = undefined;
  export let debugDraw$:
    | Observable<(ctx: CanvasRenderingContext2D) => void>
    | undefined = undefined;

  export let debugTrace:
    | {
        sources: (sceneType: SceneType) => readonly (SceneObject | undefined)[];
        colour: (args: {
          obj: SceneObject;
          index: number;
        }) => string | undefined;
      }
    | undefined = undefined;

  let makeScene: SceneSpec;
  $: makeScene = ({ random }) => {
    const objects = makeObjects(random);

    return makeSceneType({
      objects: objects,
      events: new Subject(),
      layerOrder:
        layerOrder ?? Array.from(new Set(objects.map((o) => o.layerKey))),
      typeName: "object-test-scene",
    });
  };

  const debugTrace$: Subject<(ctx: CanvasRenderingContext2D) => void> =
    new Subject();

  const _onSceneChange = (scene: SceneType) => {
    if (onSceneChange) {
      onSceneChange(scene);
    }

    if (debugTrace) {
      const objects = choose(debugTrace.sources(scene), (v) => v);
      const colourSelector = debugTrace.colour;

      objects.forEach((obj, index) => {
        debugTrace$.next((ctx) => {
          ctx.fillStyle = colourSelector({ obj, index }) ?? "black";
          ctx.fillRect(obj.getPosition().x, obj.getPosition().y, 6, 6);
        });
      });
    }
  };

  const debugOverlay = (canvas: HTMLCanvasElement): Destroyable => {
    let subscription: Subscription | undefined;

    canvas.width = sceneSize.x;
    canvas.height = sceneSize.y;

    const ctx = canvas.getContext("2d");

    if (ctx) {
      ctx.font = "24px Quicksand";
      ctx.fillText("debug overlay", 0, 24);

      subscription = merge(
        debugDraw$ ?? new Subject<(ctx: CanvasRenderingContext2D) => void>(),
        debugTrace$
      ).subscribe((command) => {
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
        initialSceneSpec: makeScene,
        images,
        seed,
        onSceneChange: _onSceneChange,
        worldClick$,
        mountSvelteComponent: () => {
          throw new Error("Not implememented");
        },
        worldDisabled$: new BehaviorSubject(false),
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
