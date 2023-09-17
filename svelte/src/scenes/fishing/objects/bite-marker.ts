import type { PRNG } from "seedrandom";
import {
  makeSceneObject,
  NumberSpringFns,
  PosFns,
  type Position,
  type SceneObject,
} from "../../../model";

export const biteMarker = (args: {
  position: Position;
  random: PRNG;
}): SceneObject => {
  const initialPosition = args.position;

  let yOffset = NumberSpringFns.make({
    position: 0,
    endPoint: 0,
    velocity: 0.4,
    properties: {
      friction: 0,
      precision: 0.1,
      stiffness: 0.5,
      weight: 0.6,
    },
  });

  return makeSceneObject(args.random)({
    layerKey: "biteMarker",
    getPosition: () =>
      PosFns.new(initialPosition.x, initialPosition.y + yOffset.position),
    getLayers: () => [
      {
        kind: "image",
        assetKey: "biteMarker",
        subLayer: "background",
      },
    ],
    onTick: () => {
      yOffset = NumberSpringFns.tick(yOffset, 0.5);
    },
  });
};
