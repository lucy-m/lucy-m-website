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
  stationary: boolean;
  properties: SpringProperties;
}

const isStationary = <T>(
  spring: {
    position: T;
    velocity: T;
    endPoint: T;
    properties: { precision: number };
  },
  distance: (a: T, b: T) => number,
  zero: T
): boolean => {
  return (
    distance(spring.position, spring.endPoint) <= spring.properties.precision &&
    distance(spring.velocity, zero) <= spring.properties.precision
  );
};

type SpringMakeFn<T> = (spring: Omit<Spring<T>, "stationary">) => Spring<T>;

const makeSpring =
  <T>(distance: (a: T, b: T) => number, zero: T) =>
  (spring: Omit<Spring<T>, "stationary">): Spring<T> => ({
    ...spring,
    stationary: isStationary(spring, distance, zero),
  });

type SpringTickFn<T> = (spring: Spring<T>, dt: number) => Spring<T>;

export const makeTick =
  <T>(
    add: (a: T, b: T) => T,
    scale: (a: T, scale: number) => T,
    distance: (a: T, b: T) => number,
    zero: T
  ): SpringTickFn<T> =>
  (spring: Spring<T>, t: number): Spring<T> => {
    const tickOne = (spring: Spring<T>, dt: number): Spring<T> => {
      if (spring.stationary) {
        return spring;
      }

      const {
        position,
        velocity,
        endPoint,
        properties: { stiffness, friction, weight },
      } = spring;

      if (isStationary(spring, distance, zero)) {
        return {
          ...spring,
          position: endPoint,
          velocity: zero,
          stationary: true,
        };
      }

      const d = add(position, scale(endPoint, -1));
      const springAcc = scale(d, -stiffness / weight);
      const frictionAcc = scale(velocity, -friction / weight);
      const acc = scale(add(springAcc, frictionAcc), dt / 100);

      return {
        ...spring,
        position: add(position, velocity),
        velocity: add(velocity, acc),
      };
    };

    const dt = 0.1;
    const fullTicks = Math.floor(t / dt);
    const partialTick = t - fullTicks * dt;

    const afterFullTicks = Array.from({ length: fullTicks }).reduce<Spring<T>>(
      (acc) => tickOne(acc, dt),
      spring
    );

    return tickOne(afterFullTicks, partialTick);
  };

type SpringSetFn<T> = (
  spring: Spring<T>,
  setValues: Partial<Spring<T>>
) => Spring<T>;

export const setSpring =
  <T>(distance: (a: T, b: T) => number, zero: T) =>
  (spring: Spring<T>, setValues: Partial<Spring<T>>): Spring<T> => {
    const newSpring = {
      ...spring,
      ...setValues,
    };

    const stationary = isStationary(newSpring, distance, zero);

    return {
      ...newSpring,
      stationary,
    };
  };

export type NumberSpring = Spring<number>;

const numberDistance = (a: number, b: number) => Math.abs(a - b);
const numberZero = 0;

export type SpringFns<T> = {
  make: SpringMakeFn<T>;
  tick: SpringTickFn<T>;
  set: SpringSetFn<T>;
};

export const NumberSpringFns: SpringFns<number> = {
  make: makeSpring<number>(numberDistance, numberZero),
  tick: makeTick<number>(
    (a, b) => a + b,
    (a, s) => a * s,
    numberDistance,
    numberZero
  ),
  set: setSpring<number>(numberDistance, numberZero),
};

export type PositionSpring = Spring<Position>;

export const PositionSpringFns: SpringFns<Position> = {
  make: makeSpring<Position>(PosFns.distance, PosFns.zero),
  tick: makeTick<Position>(
    PosFns.add,
    PosFns.scale,
    PosFns.distance,
    PosFns.zero
  ),
  set: setSpring<Position>(PosFns.distance, PosFns.zero),
};
