<script lang="ts">
  import { Scene } from "./components";
  import { loadIntroScene } from "./scenes/intro-scene";

  const source = loadIntroScene();
</script>

<Scene {source} />
