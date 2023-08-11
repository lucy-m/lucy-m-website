import { of } from "rxjs";
import type { AssetKey } from "../assets";
import { PosFns } from "../position";
import { applySceneAction, type SceneType } from "../scene";
import {
  makeSceneObject,
  type SceneObject,
  type SceneObjectAction,
} from "../scene-object";

describe("scene", () => {
  const makeTestSceneObject = (
    onTick?: () => SceneObjectAction[]
  ): SceneObject<string> =>
    makeSceneObject({
      getLayers: () => [],
      layerKey: "",
      position: PosFns.new(0, 0),
      onTick,
    });

  const makeTestScene = (
    objects: SceneObject<string>[]
  ): SceneType<string> => ({
    actions: of(),
    layerOrder: [],
    objects,
  });

  const images = {} as Record<AssetKey, HTMLImageElement>;

  describe("applySceneAction", () => {
    describe("objectA moveTo without target", () => {
      const to = PosFns.new(40, 20);
      const objectA = makeTestSceneObject(() => [{ kind: "moveTo", to }]);
      const objectB = makeTestSceneObject();
      const scene = makeTestScene([objectA, objectB]);
      const tickResult = applySceneAction(scene, images, { kind: "tick" });

      it("has all objects in order", () => {
        expect(tickResult.objects.map((o) => o.id)).to.be.deep.equal([
          objectA.id,
          objectB.id,
        ]);
      });

      it("objectA has moved", () => {
        expect(
          tickResult.objects.find((o) => o.id === objectA.id)?.position
        ).to.deep.equal(to);
      });

      it("objectB has not moved", () => {
        expect(
          tickResult.objects.find((o) => o.id === objectB.id)?.position
        ).to.deep.equal(objectB.position);
      });
    });

    describe("objectA moveTo with objectB target", () => {
      const to = PosFns.new(40, 20);
      const objectB = makeTestSceneObject();
      const objectA = makeTestSceneObject(() => [
        { kind: "moveTo", to, target: objectB.id },
      ]);
      const scene = makeTestScene([objectA, objectB]);
      const tickResult = applySceneAction(scene, images, { kind: "tick" });

      it("has all objects in order", () => {
        expect(tickResult.objects.map((o) => o.id)).to.be.deep.equal([
          objectA.id,
          objectB.id,
        ]);
      });

      it("objectA has not moved", () => {
        expect(
          tickResult.objects.find((o) => o.id === objectA.id)?.position
        ).to.deep.equal(objectA.position);
      });

      it("objectB has moved", () => {
        expect(
          tickResult.objects.find((o) => o.id === objectB.id)?.position
        ).to.deep.equal(to);
      });
    });

    describe("multiple moveBy actions", () => {
      const by = PosFns.new(1, 2);

      const objectA = makeTestSceneObject(() => [
        { kind: "moveBy", by },
        { kind: "moveBy", by },
        { kind: "moveBy", by },
      ]);
      const scene = makeTestScene([objectA]);
      const tickResult = applySceneAction(scene, images, { kind: "tick" });

      it("objectA has moved to correct position", () => {
        expect(
          tickResult.objects.find((o) => o.id === objectA.id)?.position
        ).to.deep.equal(PosFns.new(3, 6));
      });
    });

    describe("remove action without target", () => {
      const objectA = makeTestSceneObject(() => [{ kind: "removeObject" }]);
      const scene = makeTestScene([objectA]);
      const tickResult = applySceneAction(scene, images, { kind: "tick" });

      it("objectA is removed", () => {
        expect(tickResult.objects).to.be.empty;
      });
    });

    describe("remove action with target", () => {
      const objectB = makeTestSceneObject();
      const objectA = makeTestSceneObject(() => [
        { kind: "removeObject", target: objectB.id },
      ]);

      const scene = makeTestScene([objectA, objectB]);
      const tickResult = applySceneAction(scene, images, { kind: "tick" });

      it("objectB is removed", () => {
        expect(tickResult.objects.map((o) => o.id)).to.be.deep.equal([
          objectA.id,
        ]);
      });
    });

    describe("remove action with target with actions", () => {
      const to = PosFns.new(5, 10);

      const objectC = makeTestSceneObject();
      const objectB = makeTestSceneObject(() => [
        {
          kind: "moveTo",
          to,
          target: objectC.id,
        },
      ]);
      const objectA = makeTestSceneObject(() => [
        { kind: "removeObject", target: objectB.id },
      ]);

      const scene = makeTestScene([objectA, objectB, objectC]);
      const tickResult = applySceneAction(scene, images, { kind: "tick" });

      it("objectB is removed", () => {
        expect(tickResult.objects.map((o) => o.id)).to.be.deep.equal([
          objectA.id,
          objectC.id,
        ]);
      });

      it("objectC is moved", () => {
        expect(
          tickResult.objects.find((o) => o.id === objectC.id)?.position
        ).to.deep.equal(to);
      });
    });
  });
});
