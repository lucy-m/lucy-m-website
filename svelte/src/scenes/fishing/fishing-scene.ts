import { Subject } from "rxjs";
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

const layerOrder = ["bg", "man", "bite-alert", "reeling", "debug"] as const;

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
    });
  };

  const makeObjectsForState = ((): ((
    state: AnyFishingState
  ) => SceneObject[]) => {
    const castOutMan = makeSceneObjectBound({
      layerKey: "man",
      getPosition: () => PosFns.new(32, 160),
      getLayers: () => [
        {
          kind: "image",
          assetKey: "castOffMan",
          subLayer: "background",
        },
      ],
    });

    return (state) => {
      switch (state.kind) {
        case "idle":
          return [
            makeSceneObjectBound({
              layerKey: "man",
              getPosition: () => PosFns.new(80, 160),
              getLayers: () => [
                {
                  kind: "image",
                  assetKey: "idleMan",
                  subLayer: "background",
                },
              ],
            }),
          ];

        case "cast-out":
          return [castOutMan];

        case "got-a-bite":
          return [
            castOutMan,
            makeSceneObjectBound({
              layerKey: "bite-alert",
              getPosition: () => PosFns.new(1380, 440),
              getLayers: () => [
                {
                  kind: "image",
                  assetKey: "biteMarker",
                  subLayer: "background",
                },
              ],
            }),
          ];

        case "reeling":
          return [
            castOutMan,
            makeSceneObjectBound({
              layerKey: "reeling",
              getPosition: () => PosFns.new(-200, -100),
              getLayers: () => [
                {
                  kind: "image",
                  assetKey: "bigPole",
                  subLayer: "background",
                },
                {
                  kind: "image",
                  assetKey: "reelSpinner",
                  subLayer: "background",
                  position: PosFns.new(760, 365),
                },
              ],
            }),
          ];
      }
    };
  })();

  const eventsSub = new Subject<SceneAction>();

  let state: AnyFishingState = { kind: "cast-out" };
  const initial = makeObjectsForState(state);
  let currentStateObjects: SceneObject[] = initial;

  const objects = [
    ...initial,
    makeSceneObjectBound({
      layerKey: "bg",
      getPosition: () => PosFns.zero,
      getLayers: () => [
        {
          kind: "image",
          assetKey: "fishingBackground",
          subLayer: "background",
        },
      ],
    }),
  ];

  const onObjectEvent: ObjectEventHandler = ({ event }) => {
    if (event instanceof AnyFishingActionCls) {
      const newState = fishingSceneReducer(event.action, state);

      if (newState !== state) {
        currentStateObjects.forEach((obj) => {
          eventsSub.next({ kind: "removeObject", target: obj.id });
        });

        currentStateObjects = makeObjectsForState(newState);
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
