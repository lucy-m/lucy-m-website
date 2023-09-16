<script lang="ts">
  import { viewScene } from "../../scenes/drawing/view-scene";
  import seedrandom from "seedrandom";

  import { type AssetKey, type SceneType } from "../../model";

  export let sceneSpec: SceneSpec;
  export let images: Record<AssetKey, HTMLImageElement>;

  const r = seedrandom().int32();
  console.log("Congratulations! Your random seed is", r);
</script>

<canvas
  use:viewScene={{
    initialSceneSpec: sceneSpec,
    images,
    seed: r.toString(),
  }}
/>

<style>
  canvas {
    width: 100%;
    max-height: 95vh;
  }
</style>
