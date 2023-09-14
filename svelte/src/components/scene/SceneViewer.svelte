<script lang="ts">
  import { viewScene } from "../../scenes/drawing/view-scene";

  import { type AssetKey, type SceneType } from "../../model";

  type TLayerKey = $$Generic<string>;

  export let scene: SceneType<TLayerKey>;
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
