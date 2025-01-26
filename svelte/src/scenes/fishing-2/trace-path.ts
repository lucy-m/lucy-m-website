import type { PRNG } from "seedrandom";
import { makeSceneObject, PosFns, type SceneObject } from "../../model";

export const tracePath = (args: { random: PRNG }): SceneObject => {
  return makeSceneObject(args.random)({
    typeName: "trace-path",
    layerKey: "trace-path",
    getPosition: () => PosFns.new(100, 100),
    getLayers: () => [
      {
        kind: "image",
        assetKey: "bobber",
      },
    ],
    onPointerMove: () => {
      console.log("pointer move on tracePath!");
    },
  });
};
