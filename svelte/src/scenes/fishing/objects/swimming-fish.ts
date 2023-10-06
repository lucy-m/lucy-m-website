import type { PRNG } from "seedrandom";
import { makeSceneObject, PosFns, type SceneObject } from "../../../model";

export const swimmingFish = (args: { random: PRNG }): SceneObject => {
  return makeSceneObject(args.random)({
    layerKey: "pond",
    getPosition: () => PosFns.new(800, 400),
    getLayers: () => [
      {
        kind: "image",
        assetKey: "commonBrown.shadow",
      },
    ],
  });
};
