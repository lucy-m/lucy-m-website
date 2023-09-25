export type Oscillator = Readonly<{
  amplitude: number;
  period: number;
  initialX: number;
  position: number;
  time: number;
}>;

const resolvePosition = (
  oscillator: Omit<Oscillator, "position">,
  time: number
): number => {
  const value =
    oscillator.amplitude *
      Math.sin(((2 * Math.PI) / oscillator.period) * time) +
    oscillator.initialX;

  return value;
};

const make = (args: Omit<Oscillator, "position">): Oscillator => ({
  ...args,
  position: resolvePosition(args, args.time),
});

const tick = (oscillator: Oscillator, by: number): Oscillator => {
  return make({
    ...oscillator,
    time: oscillator.time + by,
  });
};

export const OscillatorFns = {
  make,
  tick,
};
