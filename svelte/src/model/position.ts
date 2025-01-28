import { z } from "zod";

export const positionSchema = z
  .object({
    x: z.number(),
    y: z.number(),
  })
  .readonly();

export type Position = z.infer<typeof positionSchema>;

const p = (x: number, y: number): Position => ({ x, y });
const zero = p(0, 0);

const add = (p1: Position, p2: Position): Position => ({
  x: p1.x + p2.x,
  y: p1.y + p2.y,
});

const sub = (p1: Position, p2: Position): Position => add(p1, neg(p2));

const scale = (p: Position, scalar: number): Position => ({
  x: p.x * scalar,
  y: p.y * scalar,
});

const neg = (p: Position): Position => scale(p, -1);

const distance = (a: Position, b: Position): number => {
  // Using Manhattan distance rather than Euclidian distance here
  //   because it is sufficient
  return Math.abs(a.x - b.x) + Math.abs(a.y - b.y);
};

const magnitude = (p: Position): number => {
  return Math.abs(p.x) + Math.abs(p.y);
};

const normalise = (p: Position): Position => {
  return scale(p, 1 / magnitude(p));
};

/**
 * Converts from x value to y value by interpolating linearly between
 * two provided points. Will return zero when a vertical line is passed in.
 */
const linearInterpolate = (
  pos1: Position,
  pos2: Position,
  inputX: number
): number => {
  const xRange = pos2.x - pos1.x;
  const yRange = pos2.y - pos1.y;

  if (xRange === 0) {
    return 0;
  }

  const xFrac = (inputX - pos1.x) / xRange;
  const yFrac = xFrac * yRange;

  return yFrac + pos1.y;
};

const toString = (p: Position): string => {
  return `(${p.x}, ${p.y})`;
};

export const PosFns = {
  new: p,
  zero,
  add,
  sub,
  scale,
  neg,
  distance,
  magnitude,
  normalise,
  linearInterpolate,
  toString,
};
