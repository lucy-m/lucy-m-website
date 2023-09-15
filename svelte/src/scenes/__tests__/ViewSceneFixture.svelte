<script lang="ts">
  import type { Observable } from "rxjs";
  import type { PRNG } from "seedrandom";
  import seedrandom from "seedrandom";
  import { loadImages, type Position, type SceneType } from "../../model";
  import { viewScene } from "../../scenes/drawing/view-scene";

  export let makeScene: (random: PRNG) => SceneType<string, any>;
  export let seed: string;
  export let onSceneChange:
    | ((scene: SceneType<string, any>) => void)
    | undefined = undefined;
  export let worldClick$: Observable<Position> | undefined = undefined;
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
