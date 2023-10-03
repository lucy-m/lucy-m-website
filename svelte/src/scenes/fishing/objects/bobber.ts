import type { PRNG } from "seedrandom";
import {
  NumberSpringFns,
  PosFns,
  makeSceneObject,
  randomBetweenPosition,
  type NumberSpring,
  type Position,
  type SceneObject,
} from "../../../model";

export const bobberBounds = {
  min: PosFns.new(800, 400),
  max: PosFns.new(1800, 1000),
};

const rodEnd = PosFns.new(1060, 175);

export type BobberState =
  | {
      kind: "throwing";
      velocity: Position;
      position: Position;
      target: Position;
      gravity: number;
    }
  | {
      kind: "stationary";
      x: number;
      spring: NumberSpring;
    };

const getPosition = (state: BobberState): Position => {
  switch (state.kind) {
    case "throwing":
      return state.position;
    case "stationary":
      return PosFns.new(state.x, state.spring.position);
  }
};

const tickBobberState = (state: BobberState): BobberState => {
  switch (state.kind) {
    case "throwing": {
      const { velocity, position, target } = state;

      const myDistance = PosFns.distance(target, position);

      if (
        position.x + velocity.x > bobberBounds.max.x ||
        position.y + velocity.y > bobberBounds.max.y ||
        myDistance < Math.abs(velocity.x) + Math.abs(velocity.y)
      ) {
        return {
          kind: "stationary",
          x: position.x,
          spring: NumberSpringFns.make({
            endPoint: position.y,
            position: position.y,
            velocity: velocity.y / 30,
            properties: {
              friction: 5,
              precision: 0.1,
              stiffness: 0.5,
              weight: 0.5,
            },
          }),
        };
      }

      return {
        kind: "throwing",
        position: PosFns.add(position, velocity),
        velocity: PosFns.new(velocity.x, velocity.y + state.gravity),
        target,
        gravity: state.gravity,
      };
    }

    case "stationary": {
      return {
        kind: "stationary",
        x: state.x,
        spring: NumberSpringFns.tick(state.spring, 1),
      };
    }
  }
};

const initial = PosFns.new(0, 300);

export const makeBobber = (args: {
  onLand: () => void;
  random: PRNG;
}): SceneObject => {
  const target = randomBetweenPosition(bobberBounds, args.random);

  let state: BobberState = (() => {
    const gravity = 0.5;
    const velocityX = 24;
    const offset = PosFns.sub(target, initial);

    const velocityY =
      (offset.y * velocityX) / offset.x -
      (gravity * offset.x) / (2 * velocityX);

    return {
      kind: "throwing",
      position: initial,
      velocity: PosFns.new(velocityX, velocityY),
      target,
      gravity,
    };
  })();

  return makeSceneObject(args.random)({
    typeName: "bobber",
    layerKey: "bobber",
    getPosition: () => getPosition(state),
    getLayers: () => [
      {
        kind: "image",
        assetKey: "bobber",
      },
      {
        kind: "ctxDraw",
        draw: (ctx) => {
          ctx.beginPath();
          ctx.strokeStyle = "hsla(0, 0%, 100%, 0.7)";
          ctx.moveTo(rodEnd.x, rodEnd.y);
          ctx.lineTo(getPosition(state).x, getPosition(state).y);
          ctx.stroke();
        },
      },
    ],
    onTick: () => {
      const newState = tickBobberState(state);

      if (newState.kind === "stationary" && state.kind !== "stationary") {
        args.onLand();
      }

      state = newState;
    },
    _getDebugInfo: () => ({
      stationary: state.kind === "stationary",
      target,
    }),
  });
};
