import { Subject } from "rxjs";
import type { PRNG } from "seedrandom";
import {
  PosFns,
  makeSceneObject,
  makeSceneType,
  type SceneAction,
  type SceneObject,
} from "../../model";
import type { ObjectEventHandler, SceneSpec } from "../../model/scene-types";
import {
  AnyFishingActionCls,
  fishingSceneReducer,
  type AnyFishingState,
} from "./fishing-state";
import { castOutMan } from "./objects/fisherman";
import { reelingOverlay } from "./reeling-overlay";

const layerOrder = [
  "bg",
  "man",
  "bobber",
  "bite-alert",
  "reeling",
  "debug",
] as const;

export const makeFishingScene =
  (_initialState?: AnyFishingState): SceneSpec =>
  (random: PRNG) => {
    const makeSceneObjectBound = makeSceneObject(random);

    const makeObjectsForState = ((): ((
      state: AnyFishingState
    ) => SceneObject[]) => {
      const castOutWaitingMan = makeSceneObjectBound({
        layerKey: "man",
        getPosition: () => PosFns.new(32, 160),
        getLayers: () => [
          {
            kind: "image",
            assetKey: "castOffWaitingMan",
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
                onInteract: () => [
                  {
                    kind: "emitEvent",
                    event: new AnyFishingActionCls({ kind: "cast-out" }),
                  },
                ],
              }),
            ];

          case "cast-out":
            return [
              castOutMan(random),
              makeSceneObjectBound({
                layerKey: "man",
                getLayers: () => [],
                getPosition: () => PosFns.zero,
                // events$: randomInterval([500, 2000], random).pipe(
                //   map(() => ({
                //     kind: "emitEvent",
                //     event: new AnyFishingActionCls({
                //       kind: "fish-bite",
                //       fishId: "" + Math.abs(random.int32()),
                //     }),
                //   }))
                // ),
              }),
            ];

          case "got-a-bite":
            return [
              castOutWaitingMan,
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
                onInteract: () => [
                  {
                    kind: "emitEvent",
                    event: new AnyFishingActionCls({ kind: "start-reel" }),
                  },
                ],
              }),
            ];

          case "reeling":
            return [castOutWaitingMan, reelingOverlay(random)];
        }
      };
    })();

    const eventsSub = new Subject<SceneAction>();

    let state: AnyFishingState = _initialState ?? { kind: "idle" };
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

    const onObjectEvent: ObjectEventHandler = (event) => {
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

          if (state.kind === "reeling" && newState.kind === "idle") {
            const fishId = state.fishId;
            const caughtFishOverlay = makeSceneObjectBound({
              layerKey: "debug",
              getPosition: () => PosFns.new(1300, 1000),
              getLayers: () => [
                {
                  kind: "text",
                  maxWidth: 600,
                  position: PosFns.zero,
                  text: ["You caught fish " + fishId],
                },
              ],
            });
            currentStateObjects.push(caughtFishOverlay);
            eventsSub.next({
              kind: "addObject",
              makeObject: () => caughtFishOverlay,
            });
          }

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
