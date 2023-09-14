<script lang="ts">
  import { Subject, type Observable } from "rxjs";
  import type { PRNG } from "seedrandom";
  import seedrandom from "seedrandom";
  import {
    loadImages,
    type Position,
    type SceneObject,
    type SceneType,
  } from "../../../model";
  import { viewScene } from "../../../scenes/drawing/view-scene";

  export let makeObject: (random: PRNG) => SceneObject<string, unknown>;
  export let seed: string;
  export let onSceneChange: ((scene: SceneType<string>) => void) | undefined =
    undefined;
  export let worldClick$: Observable<Position> | undefined = undefined;

  $: makeScene = (random: PRNG): SceneType<string> => {
    const object = makeObject(random);

    return {
      objects: [object],
      events: new Subject(),
      layerOrder: [object.layerKey],
      typeName: "object-test-scene",
    };
  };
</script>

{#await loadImages() then images}
  <canvas
    use:viewScene={{
      initialScene: makeScene(seedrandom(seed)),
      images,
      onSceneChange,
      worldClick$,
    }}
  />
{/await}

<style>
  canvas {
    width: 100%;
  }
</style>
