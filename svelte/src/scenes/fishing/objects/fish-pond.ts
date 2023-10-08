import { share, type Observable } from "rxjs";
import type { PRNG } from "seedrandom";
import {
  PosFns,
  makeSceneObject,
  type Position,
  type SceneObject,
  type Shape,
} from "../../../model";
import { swimmingFish } from "./swimming-fish";

const capacity = 3;
export const pondBounds: Shape = [
  PosFns.new(600, 350),
  PosFns.new(1250, 250),
  PosFns.new(1700, 300),
  PosFns.new(1700, 900),
  PosFns.new(500, 900),
];

export const makeFishPond = (args: {
  random: PRNG;
  bobberLocation$: Observable<Position | undefined>;
}): SceneObject => {
  const { random } = args;

  const bobberLocation$ = args.bobberLocation$.pipe(share());

  return makeSceneObject(args.random)({
    layerKey: "pond",
    getPosition: () => PosFns.zero,
    getLayers: () => [],
    onAddedToScene: () =>
      Array.from({ length: capacity }).map(() => ({
        kind: "addObject",
        makeObject: () => swimmingFish({ random, pondBounds, bobberLocation$ }),
      })),
  });
};
