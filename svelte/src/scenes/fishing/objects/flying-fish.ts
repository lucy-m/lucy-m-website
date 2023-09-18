import type { PRNG } from "seedrandom";
import {
  makeSceneObject,
  PosFns,
  type Position,
  type SceneObject,
} from "../../../model";

export const flyingFish = (args: {
  random: PRNG;
  initial: Position;
  target: Position;
}): SceneObject => {
  let stationary = false;
  let position = args.initial;

  const velocityX = -12;
  const gravity = 0.4;
  const offset = PosFns.sub(args.target, args.initial);

  let velocityY =
    (offset.y * velocityX) / offset.x - (gravity * offset.x) / (2 * velocityX);

  return makeSceneObject(args.random)({
    layerKey: "fish",
    typeName: "flying-fish",
    getPosition: () => position,
    getLayers: () => [
      {
        kind: "ctxDraw",
        subLayer: "background",
        draw: (ctx) => {
          ctx.fillRect(position.x - 20, position.y - 20, 40, 40);
        },
      },
    ],
    onTick: () => {
      if (!stationary) {
        velocityY += gravity;

        position = PosFns.add(position, PosFns.new(velocityX, velocityY));

        const myDistance = PosFns.distance(args.target, position);

        if (myDistance < Math.abs(velocityX) + Math.abs(velocityY)) {
          stationary = true;
        }
      }
    },
  });
};
