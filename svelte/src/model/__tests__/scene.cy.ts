import { of } from "rxjs";
import seedrandom from "seedrandom";
import type { AssetKey } from "../assets";
import { PosFns } from "../position";
import { applySceneEvent, makeSceneType } from "../scene";
import { makeSceneObject } from "../scene-object";
import type { SceneAction, SceneObject, SceneType } from "../scene-types";

describe("scene", () => {
  const random = seedrandom();

  const makeTestSceneObject = (onTick?: () => SceneAction[]): SceneObject =>
    makeSceneObject(random)({
      getLayers: () => [],
      layerKey: "",
      getPosition: () => PosFns.new(0, 0),
      onTick,
    });

  const makeTestScene = (objects: SceneObject[]): SceneType =>
    makeSceneType({
      typeName: "test-scene",
      events: of(),
      layerOrder: [],
      objects,
    });

  const images = {} as Record<AssetKey, HTMLImageElement>;

  describe("applySceneEvent", () => {
    describe("remove action with target", () => {
      const objectB = makeTestSceneObject();
      const objectA = makeTestSceneObject(() => [
        { kind: "removeObject", target: objectB.id },
      ]);

      const scene = makeTestScene([objectA, objectB]);
      applySceneEvent(scene, images, { kind: "tick" });

      it("objectB is removed", () => {
        expect(scene.getObjects().map((o) => o.id)).to.be.deep.equal([
          objectA.id,
        ]);
      });
    });

    describe("add action", () => {
      const objectB = makeTestSceneObject();
      const objectA = makeTestSceneObject(() => [
        { kind: "addObject", makeObject: () => objectB },
      ]);

      const scene = makeTestScene([objectA]);
      applySceneEvent(scene, images, { kind: "tick" });

      it("adds objectB", () => {
        expect(scene.getObjects().map((o) => o.id)).to.deep.equal([
          objectA.id,
          objectB.id,
        ]);
      });
    });
  });
});
