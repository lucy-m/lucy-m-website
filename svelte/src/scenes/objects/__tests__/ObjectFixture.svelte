<script lang="ts">
  import { Subject, Subscription, merge, type Observable } from "rxjs";
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
  import { choose } from "../../../utils";
  import { sceneSize } from "../../scene-size";

  export let makeObjects: (random: PRNG) => SceneObject<string>[];
  export let seed: string;
  export let onSceneChange: ((scene: SceneType<string>) => void) | undefined =
    undefined;
  export let worldClick$: Observable<Position> | undefined = undefined;
  export let debugDraw$:
    | Observable<(ctx: CanvasRenderingContext2D) => void>
    | undefined = undefined;

  export let debugTrace:
    | {
        sources: (
          sceneType: SceneType<string>
        ) => readonly (SceneObject<string> | undefined)[];
        colour: (args: {
          obj: SceneObject<string>;
          index: number;
        }) => string | undefined;
      }
    | undefined = undefined;

  $: makeScene = (random: PRNG): SceneType<string> => {
    const objects = makeObjects(random);
    const layerOrder = Array.from(new Set(objects.map((o) => o.layerKey)));

    return {
      objects: objects,
      events: new Subject(),
      layerOrder,
      typeName: "object-test-scene",
    };
  };

  const debugTrace$: Subject<(ctx: CanvasRenderingContext2D) => void> =
    new Subject();

  const _onSceneChange = (scene: SceneType<string>) => {
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

      subscription = merge(debugTrace$, debugDraw$ ?? new Subject()).subscribe(
        (command) => {
          command(ctx);
        }
      );
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
        onSceneChange: _onSceneChange,
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
