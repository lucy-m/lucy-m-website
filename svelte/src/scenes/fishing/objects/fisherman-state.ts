import type { FishName, SceneObject } from "../../../model";

export type AnyFishingState = Readonly<
  | {
      kind: "idle";
    }
  | {
      kind: "cast-out-swing";
      timer: number;
    }
  | {
      kind: "cast-out-casting";
      bobber: SceneObject;
    }
  | {
      kind: "cast-out-waiting";
      bobber: SceneObject;
    }
  | {
      kind: "got-a-bite";
      fishType: FishName;
      bobber: SceneObject;
      biteMarker: SceneObject;
    }
  | {
      kind: "reeling";
      bobber: SceneObject;
      fishType: FishName;
    }
  | {
      kind: "retrieving-fish";
      flyingFish: SceneObject;
      fishType: FishName;
    }
>;

export type FlatFishingState = {
  kind: AnyFishingState["kind"];
  fishType: FishName | undefined;
  bobber: SceneObject | undefined;
  biteMarker: SceneObject | undefined;
  flyingFish: SceneObject | undefined;
};

export const toFlatState = (anyState: AnyFishingState): FlatFishingState => {
  const kind = anyState.kind;
  const bobber = "bobber" in anyState ? anyState.bobber : undefined;
  const fishType = "fishType" in anyState ? anyState.fishType : undefined;
  const biteMarker = "biteMarker" in anyState ? anyState.biteMarker : undefined;
  const flyingFish = "flyingFish" in anyState ? anyState.flyingFish : undefined;

  return { kind, bobber, fishType, biteMarker, flyingFish };
};

export type FishingState<T extends AnyFishingState["kind"]> = Extract<
  AnyFishingState,
  { kind: T }
>;

export class AnyFishingActionCls {
  constructor(public readonly action: AnyFishingAction) {}
}

export type AnyFishingAction =
  | { kind: "start-cast-out-swing" }
  | { kind: "cast-out-land" }
  | { kind: "fish-bite"; fishType: FishName }
  | {
      kind: "start-reel";
    }
  | {
      kind: "finish-reel";
    }
  | { kind: "fish-retrieved" }
  | { kind: "tick" };

export type FishingAction<T extends AnyFishingAction["kind"]> = Extract<
  AnyFishingAction,
  { kind: T }
>;

export const makeFishingStateReducer =
  (args: {
    makeBobber: (prevState: FishingState<"cast-out-swing">) => SceneObject;
    makeFishBiteMarker: (
      prevState: FishingState<"cast-out-waiting">
    ) => SceneObject;
    makeFlyingFish: (prevState: FishingState<"reeling">) => SceneObject;
  }) =>
  (
    action: AnyFishingAction,
    state: AnyFishingState,
    proficiency: number
  ): AnyFishingState => {
    switch (action.kind) {
      case "tick": {
        if ("timer" in state) {
          if (state.timer < 0) {
            if (state.kind === "cast-out-swing") {
              return {
                kind: "cast-out-casting",
                bobber: args.makeBobber(state),
              };
            } else {
              return state;
            }
          } else {
            return { ...state, timer: state.timer - 1 };
          }
        } else {
          return state;
        }
      }

      case "start-cast-out-swing": {
        if (state.kind === "idle") {
          return {
            kind: "cast-out-swing",
            timer: Math.floor(50 * proficiency),
          };
        } else {
          return state;
        }
      }

      case "cast-out-land": {
        if (state.kind === "cast-out-casting") {
          return {
            kind: "cast-out-waiting",
            bobber: state.bobber,
          };
        } else {
          return state;
        }
      }

      case "fish-bite": {
        if (state.kind === "cast-out-waiting") {
          return {
            kind: "got-a-bite",
            fishType: action.fishType,
            biteMarker: args.makeFishBiteMarker(state),
            bobber: state.bobber,
          };
        } else {
          return state;
        }
      }

      case "start-reel": {
        if (state.kind === "got-a-bite") {
          return {
            kind: "reeling",
            fishType: state.fishType,
            bobber: state.bobber,
          };
        } else {
          return state;
        }
      }

      case "finish-reel": {
        if (state.kind === "reeling") {
          return {
            kind: "retrieving-fish",
            flyingFish: args.makeFlyingFish(state),
            fishType: state.fishType,
          };
        } else {
          return state;
        }
      }

      case "fish-retrieved": {
        if (state.kind === "retrieving-fish") {
          return { kind: "idle" };
        } else {
          return state;
        }
      }
    }
  };
