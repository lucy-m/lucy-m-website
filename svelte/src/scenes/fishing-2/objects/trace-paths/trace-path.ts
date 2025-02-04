import { BehaviorSubject, first, map, Observable } from "rxjs";
import type { PRNG } from "seedrandom";
import {
  makeSceneObject,
  PosFns,
  type AssetKey,
  type Position,
  type SceneAction,
  type SceneObject,
} from "../../../../model";
import {
  concatStates,
  linearAnimation,
  makeStateMachine,
  waitForEvent,
} from "../state-machines";

export const makeTracePathMarker = (args: {
  random: PRNG;
  position: Position;
  onPop: () => void;
}): SceneObject => {
  const state = makeStateMachine(
    concatStates([
      waitForEvent("pointerMove", { onEvent: args.onPop }),
      linearAnimation({
        fromValue: 0.7,
        toValue: 0,
        stepEnd: 7,
      }),
    ])
  );

  return makeSceneObject(args.random)({
    typeName: "path-marker",
    layerKey: "path-marker",
    getPosition: () => args.position,
    getLayers: () => {
      const current = state.getCurrent();

      if (current.kind === "animating") {
        return [
          {
            kind: "image",
            assetKey: "markerBlueExplode",
            opacity: current.current,
            scale: 2.2,
          },
        ];
      } else {
        return [
          {
            kind: "image",
            assetKey: "markerBlue",
          },
        ];
      }
    },
    onPointerMove: () => {
      return state.update("pointerMove");
    },
    onTick: () => {
      return state.update("tick");
    },
  });
};

export const makeTracePath = (args: {
  random: PRNG;
  position: Position;
  markerPositions: Position[];
  background: AssetKey;
}): SceneObject => {
  const popCount = new BehaviorSubject(0);

  const events$: Observable<SceneAction> = popCount.pipe(
    first((n) => n === args.markerPositions.length),
    map(() => ({ kind: "removeSelf" }))
  );

  return makeSceneObject(args.random)({
    typeName: "trace-path",
    layerKey: "trace-path",
    getPosition: () => args.position,
    getLayers: () => [
      {
        kind: "image",
        assetKey: args.background,
      },
    ],
    onAddedToScene: () =>
      args.markerPositions.map((position) => ({
        kind: "addObject",
        makeObject: () =>
          makeTracePathMarker({
            random: args.random,
            position: PosFns.add(args.position, position),
            onPop: () => popCount.next(popCount.value + 1),
          }),
      })),
    events$,
  });
};
