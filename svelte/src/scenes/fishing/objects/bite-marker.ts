import type { PRNG } from "seedrandom";
import {
  makeSceneObject,
  OscillatorFns,
  PosFns,
  type Position,
  type SceneObject,
} from "../../../model";

export const biteMarker = (args: {
  position: Position;
  onInteract: () => void;
  random: PRNG;
}): SceneObject => {
  const initialPosition = args.position;

  let bounce = OscillatorFns.make({
    amplitude: 20,
    initial: 20,
    period: 80,
    time: 0,
  });

  return makeSceneObject(args.random)({
    typeName: "bite-marker",
    layerKey: "bite-marker",
    getPosition: () =>
      PosFns.new(initialPosition.x, initialPosition.y + bounce.position),
    getLayers: () => [
      {
        kind: "image",
        assetKey: "biteMarker",
        shadow: {
          color: "orange",
          blur: bounce.position,
        },
      },
    ],
    onTick: () => {
      bounce = OscillatorFns.tick(bounce, 1);
    },
    onInteract: args.onInteract,
  });
};
