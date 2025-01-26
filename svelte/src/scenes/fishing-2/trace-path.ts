import type { PRNG } from "seedrandom";
import {
  makeSceneObject,
  PosFns,
  type Position,
  type SceneObject,
} from "../../model";

export const tracePathMarker = (args: {
  random: PRNG;
  position: Position;
}): SceneObject => {
  let animationStep = -1;
  const animationLength = 10;
  const animationOpacityStart = 0.5;
  const animationScaleEnd = 2;

  return makeSceneObject(args.random)((id) => ({
    typeName: "path-marker",
    layerKey: "path-marker",
    getPosition: () => args.position,
    getLayers: () => [
      {
        kind: "image",
        assetKey: "markerBlue",
        opacity:
          animationStep < 0
            ? 1
            : animationOpacityStart -
              (animationOpacityStart / animationLength) * animationStep,
        scale: 1 + ((animationScaleEnd - 1) / animationLength) * animationStep,
      },
    ],
    onPointerMove: () => {
      if (animationStep < 0) {
        animationStep = 0;
      }
    },
    onTick: () => {
      if (animationStep >= 0) {
        animationStep++;
      }

      if (animationStep > animationLength) {
        return [
          {
            kind: "removeObject",
            target: id,
          },
        ];
      }
    },
  }));
};

export const tracePath = (args: {
  random: PRNG;
  positions: Position[];
}): SceneObject => {
  return makeSceneObject(args.random)({
    typeName: "trace-path",
    layerKey: "path-marker",
    getPosition: () => PosFns.new(100, 100),
    getLayers: () => [],
    onAddedToScene: () =>
      args.positions.map((position) => ({
        kind: "addObject",
        makeObject: () => tracePathMarker({ random: args.random, position }),
      })),
  });
};
