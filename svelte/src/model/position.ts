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

const neg = (p: Position): Position => ({
  x: -p.x,
  y: -p.y,
});

const sub = (p1: Position, p2: Position): Position => add(p1, neg(p2));

export const PosFns = {
  new: p,
  add,
  zero,
  neg,
  sub,
};
