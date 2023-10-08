import { share, type Observable } from "rxjs";
import type { PRNG } from "seedrandom";
import {
  PosFns,
  makeSceneObject,
  type FishName,
  type Position,
  type SceneObject,
  type Shape,
} from "../../../model";
import { sceneSize } from "../../scene-size";
import { swimmingFish } from "./swimming-fish";

const capacity = 4;
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
  removeBitingFish$: Observable<void>;
  onFishBite: (type: FishName) => void;
}): SceneObject => {
  const { random } = args;

  const bobberLocation$ = args.bobberLocation$.pipe(share());
  const removeBitingFish$ = args.removeBitingFish$.pipe(share());

  let fishCount = 0;

  const makeSwimmingFish = (initial: Position | undefined): SceneObject => {
    const baseObject = swimmingFish({
      random,
      initial,
      pondBounds,
      bobberLocation$,
      onBite: (type) => args.onFishBite(type),
      removeBitingFish$,
    });

    return {
      ...baseObject,
      onAddedToScene: () => {
        fishCount++;
        return baseObject.onAddedToScene && baseObject.onAddedToScene();
      },
      onDestroy: () => {
        fishCount--;
        return baseObject.onDestroy && baseObject.onDestroy();
      },
    };
  };

  return makeSceneObject(args.random)({
    layerKey: "pond",
    getPosition: () => PosFns.zero,
    getLayers: () => [],
    onAddedToScene: () =>
      Array.from({ length: capacity }).map(() => ({
        kind: "addObject",
        makeObject: () => makeSwimmingFish(undefined),
      })),
    onTick: () => {
      if (fishCount < capacity && random.quick() < 0.01) {
        return [
          {
            kind: "addObject",
            makeObject: () =>
              makeSwimmingFish(PosFns.new(sceneSize.x + 50, sceneSize.y / 2)),
          },
        ];
      }
    },
  });
};
