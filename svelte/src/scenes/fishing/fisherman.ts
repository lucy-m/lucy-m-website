import { map, tap, timer } from "rxjs";
import type { PRNG } from "seedrandom";
import { PosFns, makeSceneObject, type SceneObject } from "../../model";

const bobber = (random: PRNG): SceneObject => {
  let x = -100;
  let y = 300;
  let yVelocity = -26;

  let stationary = false;

  const gravity = 1.05;
  const xVelocity = 28;

  return makeSceneObject(random)({
    typeName: "bobber",
    layerKey: "bobber",
    getPosition: () => PosFns.new(x, y),
    getLayers: () => [
      {
        kind: "image",
        assetKey: "bobber",
        subLayer: "background",
      },
    ],
    onTick: () => {
      if (!stationary) {
        x += xVelocity;
        y += yVelocity;
        yVelocity += gravity;

        if (y > 750) {
          stationary = true;
        }
      }
    },
    _getDebugInfo: () => ({
      stationary,
    }),
  });
};

export const castOutMan = (random: PRNG): SceneObject => {
  let isWaiting = false;

  return makeSceneObject(random)({
    layerKey: "man",
    getPosition: () => PosFns.new(0, 120),
    getLayers: () => [
      {
        kind: "image",
        assetKey: isWaiting ? "castOffWaitingMan" : "castOffCastingMan",
        subLayer: "background",
      },
    ],
    events$: timer(2000).pipe(
      tap(() => {
        isWaiting = true;
      }),
      map(() => ({ kind: "addObject", makeObject: () => bobber(random) }))
    ),
  });
};
