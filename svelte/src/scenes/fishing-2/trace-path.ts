import type { PRNG } from "seedrandom";
import {
  makeSceneObject,
  PosFns,
  type Position,
  type SceneObject,
} from "../../model";

export const makeTracePathMarker = (args: {
  random: PRNG;
  position: Position;
}): SceneObject => {
  let animationStep = -1;
  const animationLength = 7;
  const animationOpacityStart = 0.7;
  const animationScaleEnd = 2.2;

  return makeSceneObject(args.random)((id) => ({
    typeName: "path-marker",
    layerKey: "path-marker",
    getPosition: () => args.position,
    getLayers: () => {
      if (animationStep < 0) {
        return [
          {
            kind: "image",
            assetKey: "markerBlue",
          },
        ];
      } else {
        return [
          {
            kind: "image",
            assetKey: "markerBlueExplode",
            opacity:
              animationOpacityStart -
              (animationOpacityStart / animationLength) * animationStep,
            scale:
              1 + ((animationScaleEnd - 1) / animationLength) * animationStep,
          },
        ];
      }
    },
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

export const makeTracePath = (args: {
  random: PRNG;
  positions: Position[];
}): SceneObject => {
  return makeSceneObject(args.random)({
    typeName: "trace-path",
    layerKey: "path-marker",
    getPosition: () => PosFns.zero,
    getLayers: () => [],
    onAddedToScene: () =>
      args.positions.map((position) => ({
        kind: "addObject",
        makeObject: () =>
          makeTracePathMarker({ random: args.random, position }),
      })),
  });
};
