import { BehaviorSubject, first, map, Observable } from "rxjs";
import type { PRNG } from "seedrandom";
import {
  makeSceneObject,
  PosFns,
  type Position,
  type SceneAction,
  type SceneObject,
} from "../../../model";

export const makeTracePathMarker = (args: {
  random: PRNG;
  position: Position;
  onPop: () => void;
}): SceneObject => {
  let animationStep = -1;
  const animationLength = 7;

  const opacityLinearInterpolate = (n: number) =>
    PosFns.linearInterpolate(
      PosFns.new(0, 0.7),
      PosFns.new(animationLength, 0),
      n
    );

  return makeSceneObject(args.random)({
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
            opacity: opacityLinearInterpolate(animationStep),
            scale: 2.2,
          },
        ];
      }
    },
    onPointerMove: () => {
      if (animationStep < 0) {
        args.onPop();
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
            kind: "removeSelf",
          },
        ];
      }
    },
  });
};

export const makeTracePath = (args: {
  random: PRNG;
  positions: Position[];
}): SceneObject => {
  const popCount = new BehaviorSubject(0);

  const events$: Observable<SceneAction> = popCount.pipe(
    first((n) => n === args.positions.length),
    map(() => ({ kind: "removeSelf" }))
  );

  return makeSceneObject(args.random)((id) => ({
    typeName: "trace-path",
    layerKey: "trace-path",
    getPosition: () => PosFns.new(50, 200),
    getLayers: () => [
      {
        kind: "image",
        assetKey: "pathFish",
      },
    ],
    onAddedToScene: () =>
      args.positions.map((position) => ({
        kind: "addObject",
        makeObject: () =>
          makeTracePathMarker({
            random: args.random,
            position,
            onPop: () => popCount.next(popCount.value + 1),
          }),
      })),
    events$,
  }));
};
