import { Subject } from "rxjs";
import type { PRNG } from "seedrandom";
import { PosFns, makeSceneObject, makeSceneType } from "../../model";
import type { SceneSpec } from "../../model/scene-types";
import { type AnyFishingState } from "./fishing-state";
import { fishingMan } from "./objects/fisherman";

const layerOrder = [
  "bg",
  "man",
  "bobber",
  "bite-marker",
  "fish",
  "reeling",
  "debug",
] as const;

export const makeFishingScene =
  (_initialState?: AnyFishingState): SceneSpec =>
  (random: PRNG) => {
    const makeSceneObjectBound = makeSceneObject(random);

    const objects = [
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
      fishingMan({ random }),
    ];

    return makeSceneType({
      typeName: "fishing",
      events: new Subject(),
      layerOrder,
      objects,
    });
  };
