<script lang="ts">
  import type { Observable } from "rxjs";
  import Scene from "../../src/components/scene/Scene.svelte";
  import {
    type Position,
    type SceneSpec,
    type SceneType,
  } from "../../src/model";

  export let sceneSpec: SceneSpec;
  export let seed: string;
  export let onSceneChange: ((scene: SceneType) => void) | undefined =
    undefined;
  export let worldClick$: Observable<Position> | undefined = undefined;
</script>

<Scene {sceneSpec} _testProps={{ seed, onSceneChange, worldClick$ }} />
