import { PosFns, type Position } from "./position";

export interface SpringProperties {
  stiffness: number;
  friction: number;
  weight: number;
  precision: number;
}

export interface Spring<T> {
  position: T;
  velocity: T;
  endPoint: T;
  properties: SpringProperties;
}

const makeSpring = <T>(
  position: T,
  velocity: T,
  endPoint: T,
  properties: SpringProperties
): Spring<T> => ({
  position,
  velocity,
  endPoint,
  properties,
});

export type SpringTickFn<T> = (spring: Spring<T>, dt: number) => Spring<T>;

export const makeTick =
  <T>(
    add: (a: T, b: T) => T,
    scale: (a: T, scale: number) => T,
    distance: (a: T, b: T) => number,
    zero: T
  ): SpringTickFn<T> =>
  (spring: Spring<T>, dt: number): Spring<T> => {
    const {
      position,
      velocity,
      endPoint,
      properties: { stiffness, friction, weight, precision },
    } = spring;

    if (
      distance(position, endPoint) <= precision &&
      distance(velocity, zero) <= precision
    ) {
      return {
        ...spring,
        position: endPoint,
        velocity: zero,
      };
    }

    const d = add(position, scale(endPoint, -1));
    const springAcc = scale(d, -stiffness / weight);
    const frictionAcc = scale(velocity, -friction / weight);
    const acc = scale(add(springAcc, frictionAcc), 1 / dt);

    return {
      ...spring,
      position: add(position, velocity),
      velocity: add(velocity, acc),
    };
  };

export const setSpring = <T>(
  spring: Spring<T>,
  setValues: Partial<Spring<T>>
): Spring<T> => ({
  ...spring,
  ...setValues,
});

export type NumberSpring = Spring<number>;

export const NumberSpringFns = {
  makeSpring: makeSpring<number>,
  tick: makeTick<number>(
    (a, b) => a + b,
    (a, s) => a * s,
    (a, b) => Math.abs(a - b),
    0
  ),
  set: setSpring<number>,
};

export type PositionSpring = Spring<Position>;

export const PositionSpringFns = {
  makeSpring: makeSpring<Position>,
  tick: makeTick<Position>(
    PosFns.add,
    PosFns.scale,
    PosFns.distance,
    PosFns.zero
  ),
  set: setSpring<Position>,
};
