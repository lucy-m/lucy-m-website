import type { PRNG } from "seedrandom";
import { makeSceneObject, PosFns, type SceneObject } from "../../model";
import { AnyFishingActionCls } from "./fishing-state";

export const reelingOverlay = (random: PRNG): SceneObject => {
  const minSpeed = 0.3;
  const friction = 0.97;

  let rotation = 0;
  let rotationSpeed = minSpeed;

  return makeSceneObject(random)({
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
        rotation,
      },
    ],
    onTick: () => {
      rotation -= rotationSpeed;
      rotationSpeed = Math.max(minSpeed, rotationSpeed * friction);

      if (rotation < -360 * 4) {
        return [
          {
            kind: "emitEvent",
            event: new AnyFishingActionCls({
              kind: "finish-reel",
            }),
          },
        ];
      }
    },
    onInteract: () => {
      rotationSpeed += 2;
    },
  });
};
