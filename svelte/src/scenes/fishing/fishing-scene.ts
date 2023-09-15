import { Subject } from "rxjs";
import type { PRNG } from "seedrandom";
import {
  makeSceneObjectStateless,
  makeSceneTypeStateful,
  PosFns,
  type SceneObjectStateless,
  type SceneType,
} from "../../model";
import type { AnyFishingState } from "./fishing-state";

const layerOrder = ["bg", "debug"] as const;
type LayerKey = (typeof layerOrder)[number];

export const makeFishingScene = (
  random: PRNG
): SceneType<LayerKey, AnyFishingState> => {
  const makeSceneObjectBound = makeSceneObjectStateless(random);

  const getWorldStateObjects = (
    state: AnyFishingState
  ): SceneObjectStateless<LayerKey>[] => [
    makeSceneObjectBound({
      layerKey: "debug",
      position: PosFns.new(400, 500),
      getLayers: () => [
        {
          kind: "text",
          maxWidth: 500,
          position: PosFns.zero,
          text: [state.kind],
        },
      ],
    }),
  ];

  return makeSceneTypeStateful<LayerKey, AnyFishingState>({
    typeName: "fishing",
    events: new Subject(),
    layerOrder,
    objects: [],
    state: { kind: "idle" },
    getWorldStateObjects,
    onInteract: () => {
      console.log("World interact");
      return [
        {
          kind: "updateSceneState",
          newState: { kind: "cast-out" },
        },
      ];
    },
  });
};
