import type { PRNG } from "seedrandom";
import {
  PosFns,
  PositionSpringFns,
  generatePointsInShape,
  makeSceneObject,
  type FishName,
  type SceneObject,
  type Shape,
} from "../../../model";

export const swimmingFish = (args: {
  random: PRNG;
  pondBounds: Shape;
}): SceneObject => {
  const { random } = args;

  const getPointInPond = () => {
    return generatePointsInShape(1, args.pondBounds, random)[0] ?? PosFns.zero;
  };

  const fishType: FishName = (() => {
    if (random.quick() < 0.5) {
      return "commonBrown";
    } else {
      return "commonGrey";
    }
  })();

  let location = PositionSpringFns.make({
    endPoint: getPointInPond(),
    position: getPointInPond(),
    velocity: PosFns.zero,
    properties: {
      friction: 15,
      precision: 1,
      stiffness: 0.1,
      weight: 8,
    },
  });

  return makeSceneObject(args.random)({
    layerKey: "pond",
    getPosition: () => location.position,
    getLayers: () => [
      {
        kind: "image",
        assetKey: `${fishType}.shadow`,
      },
    ],
    onTick: () => {
      if (random.quick() < 0.01) {
        location = PositionSpringFns.set(location, {
          endPoint: getPointInPond(),
        });
      } else {
        location = PositionSpringFns.tick(location, 0.1);
      }
    },
  });
};
