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
import { exists } from "../../../../utils";
import { concatStates, linearAnimation, waitForEvent } from "../state-machines";

export const makeTracePathMarker = (args: {
  random: PRNG;
  position: Position;
  onPop: () => void;
}): SceneObject => {
  let state = concatStates([
    waitForEvent("pointerMove", { onEvent: args.onPop }),
    linearAnimation({
      fromValue: 0.7,
      toValue: 0,
      stepEnd: 7,
    }),
  ]);

  // TODO: Refactor this to a type/object that contains above state
  const updateState = (
    action: "pointerMove" | "tick"
  ): SceneAction[] | undefined => {
    const result =
      action === "pointerMove" ? state.onPointerMove?.() : state.tick?.();

    if (result === "done") {
      return [{ kind: "removeSelf" }];
    } else if (exists(result)) {
      state = result;
    }
  };

  return makeSceneObject(args.random)({
    typeName: "path-marker",
    layerKey: "path-marker",
    getPosition: () => args.position,
    getLayers: () => {
      if (state.kind === "animating") {
        return [
          {
            kind: "image",
            assetKey: "markerBlueExplode",
            opacity: state.current,
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
      return updateState("pointerMove");
    },
    onTick: () => {
      return updateState("tick");
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
