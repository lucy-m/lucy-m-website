import {
  BehaviorSubject,
  Observable,
  Subject,
  map,
  merge,
  switchMap,
  timer,
} from "rxjs";
import type { PRNG } from "seedrandom";
import {
  PosFns,
  makeSceneObject,
  type SceneAction,
  type SceneObject,
} from "../../../model";
import {
  fishingStateReducer,
  type AnyFishingAction,
  type AnyFishingState,
} from "../fishing-state";
import { makeBobber } from "./bobber";

export const castOutMan = (random: PRNG): SceneObject => {
  const initialState: AnyFishingState = { kind: "cast-out-swing" };

  const currentState = new BehaviorSubject<AnyFishingState>(initialState);
  const actionSub = new Subject<AnyFishingAction>();
  const timerActions: Observable<AnyFishingAction> = currentState.pipe(
    switchMap((state) => {
      if (state.kind === "cast-out-swing") {
        return timer(2000).pipe(
          map<unknown, AnyFishingAction>(() => ({
            kind: "finish-cast-out-swing",
          }))
        );
      } else if (state.kind === "cast-out-waiting") {
        return timer(2000).pipe(
          map<unknown, AnyFishingAction>(() => ({
            kind: "fish-bite",
            fishId: "" + Math.abs(random.int32()),
          }))
        );
      } else {
        return new Subject<AnyFishingAction>();
      }
    })
  );

  const sub = merge(actionSub, timerActions).subscribe((action) =>
    currentState.next(fishingStateReducer(action, currentState.value))
  );

  const events$ = currentState.pipe(
    map<AnyFishingState, SceneAction>((state) => {
      if (state.kind === "cast-out-casting") {
        return {
          kind: "addObject",
          makeObject: () =>
            makeBobber({
              onLand: () => {
                actionSub.next({ kind: "cast-out-land" });
              },
            })(random),
        };
      } else {
        return { kind: "noop" };
      }
    })
  );

  return makeSceneObject(random)({
    layerKey: "man",
    getPosition: () => PosFns.new(0, 120),
    getLayers: () => [
      {
        kind: "image",
        assetKey:
          currentState.value.kind === "cast-out-swing"
            ? "castOffCastingMan"
            : "castOffWaitingMan",
        subLayer: "background",
      },
    ],
    onDestroy: () => {
      sub.unsubscribe();
    },
    events$,
  });
};
