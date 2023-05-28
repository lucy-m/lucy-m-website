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

export const PosFns = {
  new: p,
  add,
  zero,
};
