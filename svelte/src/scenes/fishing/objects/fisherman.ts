import {
  BehaviorSubject,
  distinctUntilKeyChanged,
  filter,
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
  type FishName,
  type SceneAction,
  type SceneObject,
} from "../../../model";
import { filterUndefined } from "../../../utils";
import type { TalentId } from "../overlays/Talents/talents";
import { biteMarker } from "./bite-marker";
import { makeBobber } from "./bobber";
import { calcProficiency } from "./calc-proficiency";
import { makeFishPond } from "./fish-pond";
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
  onFishRetrieved: (fishType: FishName) => void;
  initialState?: AnyFishingState;
  getTalents: () => readonly TalentId[];
  getCurrentLevel: () => number;
}): SceneObject => {
  const { random } = args;
  const currentState = new BehaviorSubject<AnyFishingState>(
    args.initialState ?? { kind: "idle" }
  );
  const getProficiency = () => {
    return calcProficiency({
      level: args.getCurrentLevel(),
      talents: args.getTalents(),
    });
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
        getProficiency,
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
        fishType: prevState.fishType,
        onTargetReached: () => {
          applyFishingAction({ kind: "fish-retrieved" });
          args.onFishRetrieved(prevState.fishType);
        },
        getProficiency,
      }),
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
    onAddedToScene: () => [
      {
        kind: "addObject",
        makeObject: () =>
          makeFishPond({
            random,
            bobberLocation$: currentState.pipe(
              distinctUntilKeyChanged("kind"),
              map((state) => {
                if (state.kind === "cast-out-waiting") {
                  return state.bobber.getPosition();
                } else {
                  return undefined;
                }
              })
            ),
            removeBitingFish$: currentState.pipe(
              distinctUntilKeyChanged("kind"),
              pairwise(),
              filter(([prev, next]) => prev.kind === "reeling"),
              map(() => {})
            ),
            onFishBite: (fishType) => {
              applyFishingAction({ kind: "fish-bite", fishType });
            },
          }),
      },
    ],
    events$,
    _getDebugInfo: () => ({
      state: currentState.value,
      onFishRetrieved: args.onFishRetrieved,
    }),
  });
};
