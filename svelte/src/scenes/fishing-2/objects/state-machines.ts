import { PosFns } from "../../../model";

export type StateDone = "done";

export type ObjectStatePayload =
  | {
      kind: "animating";
      current: number;
    }
  | {
      kind: "wait-for-event";
    };

export type ObjectState = Readonly<{
  id?: string;
  tick?: () => ObjectState | StateDone;
  onPointerMove?: () => ObjectState | StateDone;
}> &
  ObjectStatePayload;

export const linearAnimation = (args: {
  id?: string;
  stepEnd: number;
  fromValue: number;
  toValue: number;
}): ObjectState => {
  const linearAnimationStepper = (step: number): ObjectState => {
    const tick = () => {
      if (step < args.stepEnd) {
        return linearAnimationStepper(step + 1);
      } else {
        return "done";
      }
    };

    const current = PosFns.linearInterpolate(
      PosFns.new(0, args.fromValue),
      PosFns.new(args.stepEnd, args.toValue),
      step
    );

    return {
      kind: "animating",
      id: args.id,
      current,
      tick,
    };
  };

  return linearAnimationStepper(0);
};

export const waitForEvent = (
  event: "pointerMove",
  args?: {
    onEvent?: () => {};
    id?: string;
  }
): ObjectState => {
  return {
    kind: "wait-for-event",
    id: args?.id,
    onPointerMove: () => {
      args?.onEvent?.();
      return "done";
    },
  };
};

/**
 * Concats two states. When the first state emits `"done"` will move to state2
 */
export const concatStates = (
  states: readonly [ObjectState, ...ObjectState[]]
): ObjectState => {
  const concatInner = (
    current: ObjectState,
    remaining: ObjectState[]
  ): ObjectState => {
    const { tick, onPointerMove } = current;

    const resultAct = (result: ObjectState | "done"): ObjectState | "done" => {
      if (result === "done") {
        const [next, ...nextRemaining] = remaining;
        if (next) {
          return concatInner(next, nextRemaining);
        } else {
          return "done";
        }
      } else {
        return concatInner(result, remaining);
      }
    };

    console.log("Current state is", current, tick, onPointerMove);

    return {
      ...current,
      tick: tick
        ? () => {
            const result = tick();
            return resultAct(result);
          }
        : undefined,
      onPointerMove: onPointerMove
        ? () => {
            const result = onPointerMove();
            return resultAct(result);
          }
        : undefined,
    };
  };

  const [initial, ...remaining] = states;

  return concatInner(initial, remaining);
};
