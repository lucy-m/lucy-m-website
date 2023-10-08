import type { PRNG } from "seedrandom";
import { PosFns, makeSceneObject } from "../../../model";

export const fishingBg = (random: PRNG) =>
  makeSceneObject(random)({
    layerKey: "background",
    getPosition: () => PosFns.zero,
    getLayers: () => [
      {
        kind: "image",
        assetKey: "fishingBackground",
      },
    ],
  });
