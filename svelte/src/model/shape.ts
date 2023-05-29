import { PosFns, type Position } from "./position";

export type Shape = Position[];

export const getRotations = <T>(array: T[]): T[][] => {
  interface Accumulator {
    left: T[];
    right: T[];
    rotations: T[][];
  }

  const initial: Accumulator = {
    left: array,
    right: [],
    rotations: [],
  };

  const reduced = array.reduce<Accumulator>((acc) => {
    const next = [...acc.left, ...acc.right];

    const rotations = [...acc.rotations, next];
    const left = acc.left.slice(1);
    const right = [...acc.right, acc.left[0]];

    return { rotations, left, right };
  }, initial);

  return reduced.rotations;
};

export const isConvex = (shape: Shape): boolean => {
  if (shape.length < 3) {
    return false;
  }

  const rotations = getRotations(shape);

  return !rotations.some((r) => {
    const p1 = r[0];
    const p2 = r[1];
    const remaining = r.slice(2);

    const diff = PosFns.sub(p2, p1);

    const m = (() => {
      if (diff.x === 0) {
        return "vertical";
      } else if (diff.y === 0) {
        return "horizontal";
      } else {
        return diff.y / diff.x;
      }
    })();

    const c = (() => {
      if (m === "vertical") {
        return p1.x;
      } else if (m === "horizontal") {
        return p1.y;
      } else {
        return p1.y - m * p1.x;
      }
    })();

    const remainingAbove = remaining.map((r) => {
      if (m === "vertical") {
        return r.x > c;
      } else if (m === "horizontal") {
        return r.y > c;
      } else {
        return r.y - m * r.x > c;
      }
    });

    const onSameSide =
      remainingAbove.every((r) => r) || remainingAbove.every((r) => !r);

    return !onSameSide;
  });
};
