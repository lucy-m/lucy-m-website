import { map, tap, timer } from "rxjs";
import type { PRNG } from "seedrandom";
import { PosFns, makeSceneObject, type SceneObject } from "../../model";

export const castOutMan = (random: PRNG): SceneObject => {
  let isWaiting = false;
  let bobberY = 220;
  let bobberYVelocity = -26;
  let bobberX = -100;
  let bobberStationary = false;

  const gravity = 1.05;
  const bobberXVelocity = 28;

  return makeSceneObject(random)({
    layerKey: "man",
    getPosition: () => PosFns.new(0, 120),
    getLayers: () => [
      {
        kind: "image",
        assetKey: isWaiting ? "castOffWaitingMan" : "castOffCastingMan",
        subLayer: "background",
      },
      {
        kind: "image",
        assetKey: "bobber",
        subLayer: "background",
        position: PosFns.new(bobberX, bobberY),
      },
    ],
    events$: timer(2000).pipe(
      tap(() => {
        isWaiting = true;
      }),
      map(() => ({ kind: "noop" }))
    ),
    onTick: () => {
      if (!bobberStationary && isWaiting) {
        bobberX += bobberXVelocity;
        bobberY += bobberYVelocity;
        bobberYVelocity += gravity;

        if (bobberY > 550) {
          bobberStationary = true;
        }
      }
    },
  });
};
