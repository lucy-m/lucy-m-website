import { map, tap, timer } from "rxjs";
import type { PRNG } from "seedrandom";
import { PosFns, makeSceneObject, type SceneObject } from "../../../model";
import { makeBobber } from "./bobber";

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
      map(() => ({ kind: "addObject", makeObject: () => makeBobber(random) }))
    ),
  });
};
