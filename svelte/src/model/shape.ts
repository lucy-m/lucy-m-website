import type { PRNG } from "seedrandom";
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

type Gradient = "vertical" | "horizontal" | number;

const calcGradient = (p1: Position, p2: Position): Gradient => {
  const diff = PosFns.sub(p2, p1);

  if (diff.x === 0) {
    return "vertical";
  } else if (diff.y === 0) {
    return "horizontal";
  } else {
    return diff.y / diff.x;
  }
};

const calcConstant = (m: Gradient, point: Position): number => {
  if (m === "vertical") {
    return point.x;
  } else if (m === "horizontal") {
    return point.y;
  } else {
    return point.y - m * point.x;
  }
};

const pointAboveLine = (m: Gradient, c: number, point: Position): boolean => {
  if (m === "vertical") {
    return point.x > c;
  } else if (m === "horizontal") {
    return point.y > c;
  } else {
    return point.y - m * point.x > c;
  }
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

    const m = calcGradient(p1, p2);
    const c = calcConstant(m, p1);

    const remainingAbove = remaining.map((r) => pointAboveLine(m, c, r));

    const onSameSide =
      remainingAbove.every((r) => r) || remainingAbove.every((r) => !r);

    return !onSameSide;
  });
};

export const pointInShape = (shape: Shape, point: Position): boolean => {
  if (!isConvex(shape)) {
    return false;
  }

  const rotations = getRotations(shape);

  return rotations.every((r) => {
    const p1 = r[0];
    const p2 = r[1];
    const pCheck = r[2];

    const m = calcGradient(p1, p2);
    const c = calcConstant(m, p1);

    const expectedSide = pointAboveLine(m, c, pCheck);
    const testSide = pointAboveLine(m, c, point);

    return expectedSide === testSide;
  });
};

export const getBoundingBox = (
  shape: Shape
): { min: Position; max: Position } | undefined => {
  if (!isConvex(shape)) {
    return undefined;
  }

  interface Accumulator {
    max: Position;
    min: Position;
  }

  const initial: Accumulator = {
    max: shape[0],
    min: shape[0],
  };

  const reduced = shape.slice(1).reduce<Accumulator>((acc, next) => {
    const max = (() => {
      const x = Math.max(acc.max.x, next.x);
      const y = Math.max(acc.max.y, next.y);

      return { x, y };
    })();

    const min = (() => {
      const x = Math.min(acc.min.x, next.x);
      const y = Math.min(acc.min.y, next.y);

      return { x, y };
    })();

    return { max, min };
  }, initial);

  return reduced;
};

/**
 * Generates a point in the shape by getting its bounding
 *   box, getting a point in it, then checking if it is in the shape.
 * The shape must be convex.
 * If your shape does not cover at least 25% of its bounding box
 *   you may have a bad time.
 */
export const generatePointsInShape = (
  target: number,
  shape: Shape,
  random: PRNG
): Position[] => {
  const boundingBox = getBoundingBox(shape);
  const maxIters = target * 4;

  if (boundingBox) {
    const generatePointsInShapeInner = (
      iterCount: number,
      current: Position[]
    ): Position[] => {
      if (iterCount >= maxIters || current.length >= target) {
        return current;
      } else {
        const x =
          random.quick() * (boundingBox.max.x - boundingBox.min.x) +
          boundingBox.min.x;
        const y =
          random.quick() * (boundingBox.max.y - boundingBox.min.y) +
          boundingBox.min.y;

        const point = PosFns.new(x, y);

        const newCurrent = pointInShape(shape, point)
          ? [...current, point]
          : current;

        return generatePointsInShapeInner(iterCount + 1, newCurrent);
      }
    };

    return generatePointsInShapeInner(0, []);
  } else {
    return [];
  }
};
