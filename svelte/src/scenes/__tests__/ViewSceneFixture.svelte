<script lang="ts">
  import type { Observable } from "rxjs";
  import type { PRNG } from "seedrandom";
  import seedrandom from "seedrandom";
  import {
    loadImages,
    type Position,
    type SceneType,
    type SceneSpec,
  } from "../../model";
  import { viewScene } from "../drawing/view-scene";

  export let initialSceneSpec: SceneSpec;
  export let seed: string;
  export let onSceneChange: ((scene: SceneType) => void) | undefined =
    undefined;
  export let worldClick$: Observable<Position> | undefined = undefined;
</script>

{#await loadImages() then images}
  <canvas
    use:viewScene={{
      initialSceneSpec,
      images,
      onSceneChange,
      worldClick$,
      seed,
    }}
  />
{/await}

<style>
  canvas {
    width: 100%;
  }
</style>
