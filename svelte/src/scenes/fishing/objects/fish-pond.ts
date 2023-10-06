import type { PRNG } from "seedrandom";
import {
  makeSceneObject,
  PosFns,
  type SceneObject,
  type Shape,
} from "../../../model";

export const makeFishPond = (args: { random: PRNG }): SceneObject => {
  const pondBounds: Shape = [
    PosFns.new(600, 350),
    PosFns.new(1250, 250),
    PosFns.new(1700, 300),
    PosFns.new(1700, 900),
    PosFns.new(500, 900),
  ];

  return makeSceneObject(args.random)({
    layerKey: "pond",
    getPosition: () => PosFns.zero,
    getLayers: () => [
      {
        kind: "image",
        assetKey: "brownFish",
        position: PosFns.new(1200, 500),
      },
      {
        kind: "ctxDraw",
        draw: (ctx) => {
          ctx.beginPath();
          pondBounds.forEach((pos) => {
            ctx.ellipse(pos.x, pos.y, 10, 10, 0, 0, 2 * Math.PI);
          });

          ctx.stroke();
        },
      },
    ],
  });
};
