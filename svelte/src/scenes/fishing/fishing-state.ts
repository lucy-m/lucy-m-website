export type AnyFishingState =
  | {
      kind: "idle";
    }
  | {
      kind: "cast-out-swing";
    }
  | {
      kind: "cast-out-casting";
    }
  | {
      kind: "cast-out-waiting";
    }
  | {
      kind: "got-a-bite";
      fishId: string;
    }
  | {
      kind: "reeling";
      fishId: string;
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
    };

export type FishingAction<T extends AnyFishingAction["kind"]> = Extract<
  AnyFishingAction,
  { kind: T }
>;

export const fishingStateReducer = (
  action: AnyFishingAction,
  state: AnyFishingState
): AnyFishingState => {
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
        return { kind: "cast-out-casting" };
      } else {
        return state;
      }
    }

    case "cast-out-land": {
      if (state.kind === "cast-out-casting") {
        return { kind: "cast-out-waiting" };
      } else {
        return state;
      }
    }

    case "fish-bite": {
      if (state.kind === "cast-out-waiting") {
        return { kind: "got-a-bite", fishId: action.fishId };
      } else {
        return state;
      }
    }

    case "start-reel": {
      if (state.kind === "got-a-bite") {
        return { kind: "reeling", fishId: state.fishId };
      } else {
        return state;
      }
    }

    case "finish-reel": {
      if (state.kind === "reeling") {
        return { kind: "idle" };
      } else {
        return state;
      }
    }
  }
};
