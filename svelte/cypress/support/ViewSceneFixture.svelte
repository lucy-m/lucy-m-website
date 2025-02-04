<script lang="ts">
  import { map, type Observable } from "rxjs";
  import Scene from "../../src/components/scene/Scene.svelte";
  import {
    type Position,
    type SceneSpec,
    type SceneType,
  } from "../../src/model";
  import type { UserInteraction } from "../../src/model/user-interactions";

  export let sceneSpec: SceneSpec;
  export let seed: string;
  export let onSceneChange: ((scene: SceneType) => void) | undefined =
    undefined;
  export let worldClick$: Observable<Position> | undefined = undefined;

  const userInteractions$: Observable<UserInteraction> | undefined =
    worldClick$?.pipe(
      map((position) => ({
        kind: "click",
        position,
      }))
    );
</script>

<Scene {sceneSpec} _testProps={{ seed, onSceneChange, userInteractions$ }} />
