import type { PRNG } from "seedrandom";
import { PosFns, type Position } from "./position";

export const randomBetween = (
  range: { max: number; min: number },
  random: PRNG
): number => {
  const { min, max } = range;

  return random.quick() * (max - min) + min;
};

export const randomBetweenPosition = (
  range: { max: Position; min: Position },
  random: PRNG
): Position => {
  const { min, max } = range;

  const x = randomBetween({ max: max.x, min: min.x }, random);
  const y = randomBetween({ max: max.y, min: min.y }, random);

  return PosFns.new(x, y);
};
