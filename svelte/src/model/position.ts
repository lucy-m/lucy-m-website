export interface Position {
  x: number;
  y: number;
}

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

export const PosFns = {
  new: p,
  zero,
  add,
  sub,
  scale,
  neg,
  distance,
};
