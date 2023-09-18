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
  onTargetReached: () => {};
}): SceneObject => {
  let stationary = false;
  let position = args.initial;

  const gravity = 0.4;
  const offset = PosFns.sub(args.target, args.initial);
  const leftToRight = offset.x > 0;
  const velocityX = leftToRight ? 12 : -12;

  let velocityY =
    (offset.y * velocityX) / offset.x - (gravity * offset.x) / (2 * velocityX);

  let rotation = (() => {
    const r = (Math.atan(velocityY / velocityX) * 180) / (2 * Math.PI);
    const adjust = velocityX < 0 ? 360 : 180;
    return r + adjust;
  })();

  const spinCount = 3;
  const spinTotal =
    360 * spinCount * (leftToRight ? 1 : -1) +
    (leftToRight ? 180 : 360) -
    rotation;

  const spinVelocity = (() => {
    const baseSpeed = (spinTotal * velocityX) / offset.x;
    // Why do the maths correctly when you can have magic numbers
    const magicAdjustmentFactor = leftToRight ? 1.018 : 1.011;

    return baseSpeed * magicAdjustmentFactor;
  })();

  return makeSceneObject(args.random)({
    layerKey: "fish",
    typeName: "flying-fish",
    getPosition: () => position,
    getLayers: () => [
      {
        kind: "image",
        assetKey: "fish1",
        subLayer: "background",
        position: PosFns.new(-75, -30),
        rotation,
      },
    ],
    onTick: () => {
      if (!stationary) {
        velocityY += gravity;
        rotation += spinVelocity;

        position = PosFns.add(position, PosFns.new(velocityX, velocityY));

        const myDistance = PosFns.distance(args.target, position);

        if (myDistance < Math.abs(velocityX) + Math.abs(velocityY)) {
          stationary = true;
          args.onTargetReached();
        }
      }
    },
    _getDebugInfo: () => ({
      rotation,
      stationary,
    }),
  });
};
