import { of } from "rxjs";
import seedrandom from "seedrandom";
import type { AssetKey } from "../assets";
import { PosFns } from "../position";
import { applySceneEvent } from "../scene";
import { makeSceneObject } from "../scene-object";
import type { SceneObject, SceneObjectAction, SceneType } from "../scene-types";

describe("scene", () => {
  const random = seedrandom();

  const makeTestSceneObject = (
    onTick?: () => SceneObjectAction<string>[]
  ): SceneObject<string> =>
    makeSceneObject(random)({
      getLayers: () => [],
      layerKey: "",
      getPosition: () => PosFns.new(0, 0),
      onTick,
    });

  const makeTestScene = (
    objects: SceneObject<string>[]
  ): SceneType<string> => ({
    typeName: "test-scene",
    events: of(),
    layerOrder: [],
    objects,
  });

  const images = {} as Record<AssetKey, HTMLImageElement>;

  describe("applySceneEvent", () => {
    describe("remove action without target", () => {
      const objectA = makeTestSceneObject(() => [{ kind: "removeObject" }]);
      const scene = makeTestScene([objectA]);
      const tickResult = applySceneEvent(scene, images, { kind: "tick" });

      it("objectA is removed", () => {
        expect(tickResult.scene.objects).to.be.empty;
      });
    });

    describe("remove action with target", () => {
      const objectB = makeTestSceneObject();
      const objectA = makeTestSceneObject(() => [
        { kind: "removeObject", target: objectB.id },
      ]);

      const scene = makeTestScene([objectA, objectB]);
      const tickResult = applySceneEvent(scene, images, { kind: "tick" });

      it("objectB is removed", () => {
        expect(tickResult.scene.objects.map((o) => o.id)).to.be.deep.equal([
          objectA.id,
        ]);
      });
    });

    describe("add action", () => {
      const objectB = makeTestSceneObject();
      const objectA = makeTestSceneObject(() => [
        {
          kind: "sceneAction",
          action: { kind: "addObject", makeObject: () => objectB },
        },
      ]);

      const scene = makeTestScene([objectA]);
      const tickResult = applySceneEvent(scene, images, { kind: "tick" });

      it("adds objectB", () => {
        expect(tickResult.scene.objects.map((o) => o.id)).to.deep.equal([
          objectA.id,
          objectB.id,
        ]);
      });
    });
  });
});
