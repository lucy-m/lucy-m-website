import { PosFns } from "../../../model";

export type StateDone = "done";

export type ObjectState<TKind extends string, TState> = Readonly<{
  kind: TKind;
  tick?: () => ObjectState<TKind, TState> | StateDone;
  onPointerMove?: () => ObjectState<TKind, TState> | StateDone;
  current: TState;
}>;

export type AnimatingState = ObjectState<"animating", number>;

export const linearAnimation = (args: {
  stepEnd: number;
  fromValue: number;
  toValue: number;
}): AnimatingState => {
  const linearAnimationStepper = (step: number): AnimatingState => {
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
      current,
      tick,
    };
  };

  return linearAnimationStepper(0);
};

export type WaitForPointerMoveState = ObjectState<"wait-for-pom", undefined>;

export const waitForPointerMove = (): WaitForPointerMoveState => {
  return {
    kind: "wait-for-pom",
    current: undefined,
    onPointerMove: () => "done",
  };
};

/**
 * Concats two states. When the first state emits `"done"` will move to state2
 */
export const concatStates = <
  T1Kind extends string,
  T2Kind extends string,
  T1State,
  T2State
>(
  state1: ObjectState<T1Kind, T1State>,
  state2: ObjectState<T2Kind, T2State>
): ObjectState<T1Kind | T2Kind, T1State | T2State> => {
  const { tick, onPointerMove } = state1;

  return {
    kind: state1.kind,
    tick: tick
      ? () => {
          const result = tick();
          console.debug("Ticking state result", result);
          if (result === "done") {
            return state2;
          } else {
            return concatStates(result, state2);
          }
        }
      : undefined,
    onPointerMove: onPointerMove
      ? () => {
          const result = onPointerMove();
          if (result === "done") {
            return state2;
          } else {
            return concatStates(result, state2);
          }
        }
      : undefined,
    current: state1.current,
  };
};
