import type { PRNG } from "seedrandom";
import {
  NumberSpringFns,
  PosFns,
  makeSceneObject,
  type NumberSpring,
  type Position,
  type SceneObject,
} from "../../../model";

export const bobberBounds = {
  min: PosFns.new(800, 400),
  max: PosFns.new(1800, 1000),
};

const rodEnd = PosFns.new(1060, 175);

const gravity = 1.05;

const xVelocityMax = 33;
const xVelocityMin = 15;

export type BobberState =
  | {
      kind: "throwing";
      velocity: Position;
      yTarget: number;
      position: Position;
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
      const { velocity, yTarget, position } = state;

      if (
        position.x + velocity.x > bobberBounds.max.x ||
        position.y + velocity.y > bobberBounds.max.y ||
        position.y > yTarget
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
        velocity: PosFns.new(velocity.x, velocity.y + gravity),
        yTarget,
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

export const makeBobber = (args: {
  onLand: () => void;
  random: PRNG;
}): SceneObject => {
  const xVelocity =
    args.random.quick() * (xVelocityMax - xVelocityMin) + xVelocityMin;

  const yTarget =
    args.random.quick() * (bobberBounds.max.y - bobberBounds.min.y) +
    bobberBounds.min.y;

  let state: BobberState = {
    kind: "throwing",
    position: PosFns.new(-100, 300),
    velocity: PosFns.new(xVelocity, -26),
    yTarget,
  };
  return makeSceneObject(args.random)({
    typeName: "bobber",
    layerKey: "bobber",
    getPosition: () => getPosition(state),
    getLayers: () => [
      {
        kind: "image",
        assetKey: "bobber",
        subLayer: "background",
      },
      {
        kind: "ctxDraw",
        subLayer: "text",
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
    }),
  });
};
