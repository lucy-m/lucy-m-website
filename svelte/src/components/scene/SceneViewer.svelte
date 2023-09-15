<script lang="ts">
  import { viewScene } from "../../scenes/drawing/view-scene";

  import { type AssetKey, type SceneType } from "../../model";

  export let scene: SceneType<string, unknown>;
  export let images: Record<AssetKey, HTMLImageElement>;
</script>

<canvas
  use:viewScene={{
    initialScene: scene,
    images,
  }}
/>

<style>
  canvas {
    width: 100%;
    max-height: 95vh;
  }
</style>
