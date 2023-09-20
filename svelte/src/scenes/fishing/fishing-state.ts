import type { SceneObject } from "../../model";

export type AnyFishingState =
  | {
      kind: "idle";
    }
  | {
      kind: "cast-out-swing";
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
      fishId: string;
      bobber: SceneObject;
      biteMarker: SceneObject;
    }
  | {
      kind: "reeling";
      bobber: SceneObject;
      fishId: string;
    }
  | {
      kind: "retrieving-fish";
      flyingFish: SceneObject;
      fishId: string;
    };

export type FlatFishingState = {
  kind: AnyFishingState["kind"];
  fishId: string | undefined;
  bobber: SceneObject | undefined;
  biteMarker: SceneObject | undefined;
  flyingFish: SceneObject | undefined;
};

export const toFlatState = (anyState: AnyFishingState): FlatFishingState => {
  const kind = anyState.kind;
  const bobber = "bobber" in anyState ? anyState.bobber : undefined;
  const fishId = "fishId" in anyState ? anyState.fishId : undefined;
  const biteMarker = "biteMarker" in anyState ? anyState.biteMarker : undefined;
  const flyingFish = "flyingFish" in anyState ? anyState.flyingFish : undefined;

  return { kind, bobber, fishId, biteMarker, flyingFish };
};

export type FishingState<T extends AnyFishingState["kind"]> = Extract<
  AnyFishingState,
  { kind: T }
>;

export class AnyFishingActionCls {
  constructor(public readonly action: AnyFishingAction) {}
}

export type AnyFishingAction =
  | {
      kind: "cast-out";
    }
  | { kind: "start-cast-out-swing" }
  | { kind: "finish-cast-out-swing" }
  | { kind: "cast-out-land" }
  | {
      kind: "fish-bite";
      fishId: string;
    }
  | {
      kind: "start-reel";
    }
  | {
      kind: "finish-reel";
    }
  | { kind: "fish-retrieved" };

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
  (action: AnyFishingAction, state: AnyFishingState): AnyFishingState => {
    switch (action.kind) {
      case "cast-out": {
        if (state.kind === "idle") {
          return { kind: "cast-out-swing" };
        } else {
          return state;
        }
      }

      case "start-cast-out-swing": {
        if (state.kind === "cast-out-swing") {
          return { kind: "cast-out-swing" };
        } else {
          return state;
        }
      }

      case "finish-cast-out-swing": {
        if (state.kind === "cast-out-swing") {
          return {
            kind: "cast-out-casting",
            bobber: args.makeBobber(state),
          };
        } else {
          return state;
        }
      }

      case "cast-out-land": {
        if (state.kind === "cast-out-casting") {
          return { kind: "cast-out-waiting", bobber: state.bobber };
        } else {
          return state;
        }
      }

      case "fish-bite": {
        if (state.kind === "cast-out-waiting") {
          return {
            kind: "got-a-bite",
            fishId: action.fishId,
            bobber: state.bobber,
            biteMarker: args.makeFishBiteMarker(state),
          };
        } else {
          return state;
        }
      }

      case "start-reel": {
        if (state.kind === "got-a-bite") {
          return {
            kind: "reeling",
            fishId: state.fishId,
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
            fishId: state.fishId,
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
