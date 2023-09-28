import type { PRNG } from "seedrandom";
import {
  makeSceneObject,
  OscillatorFns,
  PosFns,
  type SceneObject,
} from "../../../model";

export const reelingOverlay = (args: {
  random: PRNG;
  onComplete: () => void;
}): SceneObject => {
  const minSpeed = 0.3;
  const friction = 0.97;
  const requiredRotation = 360 * 4;
  const yVelocity = 50;
  const yOffScreen = -1400;
  const yOnScreen = -100;

  let position = PosFns.new(-200, yOffScreen);

  let exiting = false;
  let rotation = 0;
  let rotationSpeed = minSpeed;
  let completeCalled = false;

  let reelPulse = OscillatorFns.make({
    amplitude: 30,
    initial: 40,
    time: 0,
    period: 50,
  });

  return makeSceneObject(args.random)((id) => ({
    typeName: "reeling-overlay",
    layerKey: "reeling",
    getPosition: () => position,
    getLayers: () => [
      {
        kind: "image",
        assetKey: "bigPole",
      },
      {
        kind: "image",
        assetKey: "reelSpinner",
        position: PosFns.new(760, 365),
        rotation: -rotation,
        shadow: {
          color: "orange",
          blur: reelPulse.position,
        },
      },
    ],
    onTick: () => {
      reelPulse = OscillatorFns.tick(reelPulse, 1);

      rotation += rotationSpeed;
      rotationSpeed = Math.max(minSpeed, rotationSpeed * friction);

      if (rotation > requiredRotation && !completeCalled) {
        args.onComplete();
        completeCalled = true;
        exiting = true;
      }

      if (exiting) {
        if (position.y < yOffScreen) {
          return [
            {
              kind: "removeObject",
              target: id,
            },
          ];
        } else {
          position = PosFns.new(position.x, position.y - yVelocity);
        }
      } else {
        if (position.y < yOnScreen) {
          position = PosFns.new(position.x, position.y + yVelocity);
        }
      }
    },
    onInteract: () => {
      rotationSpeed += 2;
    },
    _getDebugInfo: () => ({
      rotation,
      rotationSpeed,
      exiting,
    }),
  }));
};
