import {
  BehaviorSubject,
  distinctUntilKeyChanged,
  from,
  map,
  mergeMap,
  pairwise,
} from "rxjs";
import type { PRNG } from "seedrandom";
import {
  OscillatorFns,
  PosFns,
  makeSceneObject,
  type SceneAction,
  type SceneObject,
} from "../../../model";
import { filterUndefined } from "../../../utils";
import { biteMarker } from "./bite-marker";
import { makeBobber } from "./bobber";
import {
  makeFishingStateReducer,
  toFlatState,
  type AnyFishingAction,
  type AnyFishingState,
  type FlatFishingState,
} from "./fisherman-state";
import { flyingFish } from "./flying-fish";
import { reelingOverlay } from "./reeling-overlay";

export const fishingMan = (args: {
  random: PRNG;
  onFishRetrieved: (fishId: string) => void;
  initialState?: AnyFishingState;
  getCurrentLevel: () => number;
}): SceneObject => {
  const { random } = args;
  const currentState = new BehaviorSubject<AnyFishingState>(
    args.initialState ?? { kind: "idle" }
  );
  const getProficiency = () => {
    return Math.pow(0.98, args.getCurrentLevel() - 1);
  };

  let interactShadow = OscillatorFns.make({
    amplitude: 10,
    initial: 20,
    period: 80,
    time: 0,
  });

  const stateReducer = makeFishingStateReducer({
    makeBobber: () =>
      makeBobber({
        onLand: () => {
          applyFishingAction({ kind: "cast-out-land" });
        },
        random,
      }),
    makeFishBiteMarker: (prevState) =>
      biteMarker({
        position: PosFns.add(
          prevState.bobber.getPosition(),
          PosFns.new(-20, -280)
        ),
        onInteract: () => {
          applyFishingAction({
            kind: "start-reel",
          });
        },
        random,
      }),
    makeFlyingFish: (prevState) =>
      flyingFish({
        random,
        initial: prevState.bobber.getPosition(),
        target: PosFns.new(100, 400),
        onTargetReached: () => {
          applyFishingAction({ kind: "fish-retrieved" });
          args.onFishRetrieved(prevState.fishId);
        },
        getProficiency,
      }),
    makeFishId: () => "" + Math.abs(random.int32()),
  });

  const applyFishingAction = (action: AnyFishingAction): void => {
    const nextState = stateReducer(
      action,
      currentState.value,
      getProficiency()
    );
    if (nextState !== currentState.value) {
      currentState.next(nextState);
    }
  };

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

        const reelingOverlayAction: SceneAction | undefined =
          nextState.kind === "reeling"
            ? {
                kind: "addObject",
                makeObject: () =>
                  reelingOverlay({
                    random,
                    onComplete: () => {
                      applyFishingAction({
                        kind: "finish-reel",
                      });
                    },
                    getProficiency,
                  }),
              }
            : undefined;
        const flyingFishAction = stateBasedObjectAction((s) => s.flyingFish);

        return filterUndefined([
          bobberAction,
          biteMarkerAction,
          reelingOverlayAction,
          flyingFishAction,
        ]);
      }
    ),
    mergeMap((v) => from(v))
  );

  return makeSceneObject(random)({
    typeName: "fisherman",
    layerKey: "man",
    getPosition: () => PosFns.new(0, 120),
    getLayers: () => [
      (() => {
        if (currentState.value.kind === "idle") {
          return {
            kind: "image",
            assetKey: "idleMan",
            shadow: {
              color: "orange",
              blur: interactShadow.position,
            },
          };
        } else if (currentState.value.kind === "cast-out-swing") {
          return {
            kind: "image",
            assetKey: "castOffCastingMan",
            position: PosFns.new(-50, -50),
          };
        } else {
          return {
            kind: "image",
            assetKey: "castOffWaitingMan",
          };
        }
      })(),
    ],
    onInteract: () => {
      applyFishingAction({ kind: "start-cast-out-swing" });
    },
    onTick: () => {
      applyFishingAction({ kind: "tick" });
      interactShadow = OscillatorFns.tick(interactShadow, 1);
    },
    events$,
    _getDebugInfo: () => ({
      state: currentState.value,
      onFishRetrieved: args.onFishRetrieved,
    }),
  });
};
