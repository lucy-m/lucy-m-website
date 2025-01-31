import { PosFns } from "../../../model";

export type AnimatingState = {
  kind: "animating";
  tick: () => AnimatingState | undefined;
  currentValue: number;
};

export const linearAnimation = (args: {
  stepEnd: number;
  fromValue: number;
  toValue: number;
}): AnimatingState => {
  const linearAnimationStepper = (step: number): AnimatingState => {
    const tick = () => {
      if (step < args.stepEnd) {
        return linearAnimationStepper(step + 1);
      }
    };

    const currentValue = PosFns.linearInterpolate(
      PosFns.new(0, args.fromValue),
      PosFns.new(args.stepEnd, args.toValue),
      step
    );

    return {
      kind: "animating",
      currentValue,
      tick,
    };
  };

  return linearAnimationStepper(0);
};
