import seedrandom from "seedrandom";
import type { AssetKey } from "../assets";
import { PosFns, type Position } from "../position";
import { getObjectBoundingBox, makeSceneObject } from "../scene-object";

describe("scene object", () => {
  describe("getObjectBoundingBox", () => {
    const random = seedrandom();

    const makeTestImage = (width: number, height: number) => {
      return { width, height } as ImageBitmap;
    };

    const makeTestObject = (
      position: Position,
      layers: [AssetKey, Position][]
    ) => {
      return makeSceneObject(random)({
        getLayers: () =>
          layers.map(([assetKey, position]) => ({
            kind: "image",
            assetKey,
            position,
          })),
        layerKey: "",
        getPosition: () => position,
      });
    };

    const assets: Record<AssetKey, ImageBitmap> = (() => {
      const value: Partial<Record<AssetKey, ImageBitmap>> = {
        introBackground: makeTestImage(200, 150),
        tree1: makeTestImage(40, 15),
        tree2: makeTestImage(1, 1),
      };

      return value as unknown as Record<AssetKey, ImageBitmap>;
    })();

    it("empty object", () => {
      const obj = makeTestObject(PosFns.zero, []);
      const boundingBox = getObjectBoundingBox(obj, assets);

      expect(boundingBox.topLeft).to.deep.equal(PosFns.zero);
      expect(boundingBox.bottomRight).to.deep.equal(PosFns.zero);
    });

    it("object with one image", () => {
      const obj = makeTestObject(PosFns.zero, [
        ["introBackground", PosFns.zero],
      ]);
      const boundingBox = getObjectBoundingBox(obj, assets);

      expect(boundingBox.topLeft).to.deep.equal(PosFns.zero);
      expect(boundingBox.bottomRight).to.deep.equal(PosFns.new(200, 150));
    });

    it("object with position", () => {
      const obj = makeTestObject(PosFns.new(20, 30), [
        ["introBackground", PosFns.zero],
      ]);
      const boundingBox = getObjectBoundingBox(obj, assets);

      expect(boundingBox.topLeft).to.deep.equal(PosFns.new(20, 30));
      expect(boundingBox.bottomRight).to.deep.equal(PosFns.new(220, 180));
    });

    it("object with positioned layer", () => {
      const obj = makeTestObject(PosFns.zero, [
        ["introBackground", PosFns.new(5, -10)],
      ]);
      const boundingBox = getObjectBoundingBox(obj, assets);

      expect(boundingBox.topLeft).to.deep.equal(PosFns.new(5, -10));
      expect(boundingBox.bottomRight).to.deep.equal(PosFns.new(205, 140));
    });

    it("object with multiple layers", () => {
      const obj = makeTestObject(PosFns.zero, [
        ["introBackground", PosFns.zero],
        ["tree1", PosFns.new(180, 140)], // object positioned at bottom right of prev layer
      ]);
      const boundingBox = getObjectBoundingBox(obj, assets);

      expect(boundingBox.topLeft).to.deep.equal(PosFns.zero);
      expect(boundingBox.bottomRight).to.deep.equal(PosFns.new(220, 155));
    });
  });
});
