import { Subject, map, timer } from "rxjs";
import type { PRNG } from "seedrandom";
import {
  PosFns,
  makeSceneObject,
  makeSceneType,
  type Position,
  type SceneAction,
  type SceneObject,
} from "../../model";
import type { ObjectEventHandler, SceneSpec } from "../../model/scene-types";
import {
  AnyFishingActionCls,
  fishingSceneReducer,
  type AnyFishingAction,
  type AnyFishingState,
} from "./fishing-state";

const layerOrder = ["bg", "debug"] as const;

export const makeFishingScene: SceneSpec = (random: PRNG) => {
  const makeSceneObjectBound = makeSceneObject(random);

  const makeDebugText = (
    text: string,
    position: Position,
    action: AnyFishingAction
  ): SceneObject => {
    return makeSceneObjectBound({
      layerKey: "debug",
      getPosition: () => position,
      getLayers: () => [
        {
          kind: "text",
          maxWidth: 500,
          position: PosFns.zero,
          text: [text],
        },
      ],
      events$: timer(1000).pipe(
        map(() => ({
          kind: "arbitrary",
          event: new AnyFishingActionCls(action),
        }))
      ),
    });
  };

  const makeObjectsForState = (state: AnyFishingState): SceneObject => {
    switch (state.kind) {
      case "idle":
        return makeDebugText("idle", PosFns.new(100, 100), {
          kind: "cast-out",
        });

      case "cast-out":
        return makeDebugText("cast-out", PosFns.new(100, 200), {
          kind: "fish-bite",
          fishId: "wally",
        });

      case "got-a-bite":
        return makeDebugText("got-a-bite", PosFns.new(100, 300), {
          kind: "start-reel",
        });

      case "reeling":
        return makeDebugText("reeling", PosFns.new(100, 400), {
          kind: "finish-reel",
        });
    }
  };

  const eventsSub = new Subject<SceneAction>();

  let state: AnyFishingState = { kind: "idle" };
  const initial = makeObjectsForState(state);
  let currentStateObjects: SceneObject[] = [initial];

  const objects = [initial];

  const onObjectEvent: ObjectEventHandler = ({ event }) => {
    if (event instanceof AnyFishingActionCls) {
      const newState = fishingSceneReducer(event.action, state);

      if (newState !== state) {
        currentStateObjects.forEach((obj) => {
          eventsSub.next({ kind: "removeObject", target: obj.id });
        });

        currentStateObjects = [makeObjectsForState(newState)];
        currentStateObjects.forEach((obj) => {
          eventsSub.next({ kind: "addObject", makeObject: () => obj });
        });

        state = newState;
      }
    }
  };

  return makeSceneType({
    typeName: "fishing",
    events: eventsSub,
    layerOrder,
    objects: objects,
    onObjectEvent,
  });
};
