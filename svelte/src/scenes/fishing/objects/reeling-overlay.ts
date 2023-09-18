import type { PRNG } from "seedrandom";
import { makeSceneObject, PosFns, type SceneObject } from "../../../model";

export const reelingOverlay = (args: {
  random: PRNG;
  onComplete: () => void;
}): SceneObject => {
  const minSpeed = 0.3;
  const friction = 0.97;
  const requiredRotation = 360 * 4;

  let rotation = 0;
  let rotationSpeed = minSpeed;
  let completeCalled = false;

  return makeSceneObject(args.random)({
    typeName: "reel",
    layerKey: "reeling",
    getPosition: () => PosFns.new(-200, -100),
    getLayers: () => [
      {
        kind: "image",
        assetKey: "bigPole",
        subLayer: "background",
      },
      {
        kind: "image",
        assetKey: "reelSpinner",
        subLayer: "background",
        position: PosFns.new(760, 365),
        rotation: -rotation,
      },
    ],
    onTick: () => {
      rotation += rotationSpeed;
      rotationSpeed = Math.max(minSpeed, rotationSpeed * friction);

      if (rotation > requiredRotation && !completeCalled) {
        args.onComplete();
        completeCalled = true;
      }
    },
    onInteract: () => {
      rotationSpeed += 2;
    },
    _getDebugInfo: () => ({
      rotation,
      rotationSpeed,
    }),
  });
};
