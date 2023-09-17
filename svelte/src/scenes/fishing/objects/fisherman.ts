import {
  BehaviorSubject,
  Observable,
  Subject,
  from,
  map,
  merge,
  mergeMap,
  pairwise,
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
import { choose } from "../../../utils";
import {
  fishingStateReducer,
  type AnyFishingAction,
  type AnyFishingState,
} from "../fishing-state";
import { biteMarker } from "./bite-marker";
import { makeBobber } from "./bobber";

export const fishingMan = (random: PRNG): SceneObject => {
  const initialState: AnyFishingState = { kind: "idle" };

  const currentState = new BehaviorSubject<AnyFishingState>(initialState);
  const actionSub = new Subject<AnyFishingAction>();
  const timerActions: Observable<AnyFishingAction> = currentState.pipe(
    switchMap((state) => {
      if (state.kind === "cast-out-swing") {
        return timer(2000).pipe(
          map<unknown, AnyFishingAction>(() => ({
            kind: "finish-cast-out-swing",
            bobber: makeBobber({
              onLand: () => {
                actionSub.next({ kind: "cast-out-land" });
              },
              random,
            }),
          }))
        );
      } else if (state.kind === "cast-out-waiting") {
        return timer(2000).pipe(
          map<unknown, AnyFishingAction>(() => ({
            kind: "fish-bite",
            fishId: "" + Math.abs(random.int32()),
            biteMarker: biteMarker({
              position: PosFns.add(
                state.bobber.getPosition(),
                PosFns.new(-20, -280)
              ),
              onInteract: () => {
                actionSub.next({ kind: "start-reel" });
              },
              random,
            }),
          }))
        );
      } else {
        return new Subject<AnyFishingAction>();
      }
    })
  );

  const sub = merge(actionSub, timerActions).subscribe((action) => {
    const nextState = fishingStateReducer(action, currentState.value);
    console.log("Next state", nextState);
    currentState.next(nextState);
  });

  const events$ = currentState.pipe(
    pairwise(),
    map<[AnyFishingState, AnyFishingState], SceneAction[]>(
      ([prevState, nextState]) => {
        const addAction: SceneAction | undefined = (() => {
          if (nextState.kind === "cast-out-casting") {
            return {
              kind: "addObject",
              makeObject: () => nextState.bobber,
            };
          } else if (nextState.kind === "got-a-bite") {
            return {
              kind: "addObject",
              makeObject: () => nextState.biteMarker,
            };
          }
        })();

        const removeAction: SceneAction | undefined = (() => {
          if (prevState.kind === "got-a-bite") {
            return {
              kind: "removeObject",
              target: prevState.biteMarker.id,
            };
          }
        })();

        return choose([addAction, removeAction], (v) => v);
      }
    ),
    mergeMap((v) => from(v))
  );

  return makeSceneObject(random)({
    layerKey: "man",
    getPosition: () => PosFns.new(0, 120),
    getLayers: () => [
      {
        kind: "image",
        assetKey:
          currentState.value.kind === "idle"
            ? "idleMan"
            : currentState.value.kind === "cast-out-swing"
            ? "castOffCastingMan"
            : "castOffWaitingMan",
        subLayer: "background",
      },
    ],
    onDestroy: () => {
      sub.unsubscribe();
    },
    onInteract: () => {
      actionSub.next({ kind: "cast-out" });
    },
    events$,
  });
};
