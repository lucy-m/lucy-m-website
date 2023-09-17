import { map, tap, timer } from "rxjs";
import type { PRNG } from "seedrandom";
import { PosFns, makeSceneObject, type SceneObject } from "../../model";

export const bobberBounds = {
  min: PosFns.new(800, 400),
  max: PosFns.new(1800, 1000),
};

const bobber = (random: PRNG): SceneObject => {
  let x = -100;
  let y = 300;
  let yVelocity = -26;

  let stationary = false;

  const gravity = 1.05;

  const xVelocityMax = 33;
  const xVelocityMin = 15;
  const xVelocity =
    random.quick() * (xVelocityMax - xVelocityMin) + xVelocityMin;
  const yTarget =
    random.quick() * (bobberBounds.max.y - bobberBounds.min.y) +
    bobberBounds.min.y;

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

        if (x + xVelocity > bobberBounds.max.x) {
          stationary = true;
        }

        if (y + yVelocity > bobberBounds.max.y || y > yTarget) {
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
