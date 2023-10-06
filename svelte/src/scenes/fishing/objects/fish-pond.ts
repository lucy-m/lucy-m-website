import type { PRNG } from "seedrandom";
import {
  makeSceneObject,
  PosFns,
  type SceneObject,
  type Shape,
} from "../../../model";
import { swimmingFish } from "./swimming-fish";

const capacity = 5;

export const makeFishPond = (args: { random: PRNG }): SceneObject => {
  const { random } = args;

  const pondBounds: Shape = [
    PosFns.new(600, 350),
    PosFns.new(1250, 250),
    PosFns.new(1700, 300),
    PosFns.new(1700, 900),
    PosFns.new(500, 900),
  ];

  let fishCount = 0;

  return makeSceneObject(args.random)({
    layerKey: "pond",
    getPosition: () => PosFns.zero,
    getLayers: () => [],
    onTick: () => {
      if (fishCount < capacity) {
        fishCount++;
        return [
          {
            kind: "addObject",
            makeObject: () => swimmingFish({ random, pondBounds }),
          },
        ];
      }
    },
  });
};
