import {
  BehaviorSubject,
  Observable,
  Subject,
  distinctUntilKeyChanged,
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
  toFlatState,
  type AnyFishingAction,
  type AnyFishingState,
  type FlatFishingState,
} from "../fishing-state";
import { biteMarker } from "./bite-marker";
import { makeBobber } from "./bobber";
import { reelingOverlay } from "./reeling-overlay";

export const fishingMan = (args: {
  random: PRNG;
  initialState?: AnyFishingState;
}): SceneObject => {
  const { random } = args;
  const initialState: AnyFishingState = args.initialState ?? { kind: "idle" };

  const currentState = new BehaviorSubject<AnyFishingState>(initialState);
  const actionSub = new Subject<AnyFishingAction>();
  const timerActions: Observable<AnyFishingAction> = currentState.pipe(
    switchMap((state) => {
      if (state.kind === "cast-out-swing") {
        return timer(1000).pipe(
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
        return timer(1000).pipe(
          map<unknown, AnyFishingAction>(() => ({
            kind: "fish-bite",
            fishId: "" + Math.abs(random.int32()),
            biteMarker: biteMarker({
              position: PosFns.add(
                state.bobber.getPosition(),
                PosFns.new(-20, -280)
              ),
              onInteract: () => {
                actionSub.next({
                  kind: "start-reel",
                  reelingOverlay: reelingOverlay({
                    random,
                    onComplete: () => {
                      actionSub.next({
                        kind: "finish-reel",
                      });
                    },
                  }),
                });
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
    if (nextState !== currentState.value) {
      currentState.next(nextState);
    }
  });

  const events$ = currentState.pipe(
    distinctUntilKeyChanged("kind"),
    pairwise(),
    map<[AnyFishingState, AnyFishingState], SceneAction[]>(
      ([prevState, nextState]) => {
        const nextFlat = toFlatState(nextState);
        const prevFlat = toFlatState(prevState);

        const stateBasedObjectAction = (
          selector: (value: FlatFishingState) => SceneObject | undefined,
          options?: { manuallyRemoved?: boolean }
        ): SceneAction | undefined => {
          const nextValue = selector(nextFlat);
          const prevValue = selector(prevFlat);

          if (nextValue && !prevValue) {
            return {
              kind: "addObject",
              makeObject: () => nextValue,
            };
          } else if (prevValue && !nextValue && !options?.manuallyRemoved) {
            return {
              kind: "removeObject",
              target: prevValue.id,
            };
          }
        };

        const bobberAction = stateBasedObjectAction((s) => s.bobber);
        const biteMarkerAction = stateBasedObjectAction((s) => s.biteMarker);
        const reelingOverlayAction = stateBasedObjectAction(
          (s) => s.reelingOverlay,
          { manuallyRemoved: true }
        );

        return choose(
          [bobberAction, biteMarkerAction, reelingOverlayAction],
          (v) => v
        );
      }
    ),
    mergeMap((v) => from(v))
  );

  return makeSceneObject(random)({
    typeName: "fisherman",
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
    _getDebugInfo: () => ({
      state: currentState.value,
    }),
  });
};
