import { Subject } from "rxjs";
import {
  PosFns,
  makeSceneObject,
  makeSceneType,
  type ObjectLayerContent,
} from "../../model";
import type { SceneSpec } from "../../model/scene-types";
import { choose } from "../../utils";
import FishCaughtNotification from "./FishCaughtNotification.svelte";
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
  (): SceneSpec =>
  ({ random, mountSvelteComponent }) => {
    const makeSceneObjectBound = makeSceneObject(random);

    const objects = [
      makeSceneObjectBound({
        layerKey: "bg",
        getPosition: () => PosFns.zero,
        getLayers: () =>
          choose<ObjectLayerContent | undefined, ObjectLayerContent>(
            [
              {
                kind: "image",
                assetKey: "fishingBackground",
                subLayer: "background",
              },
            ],
            (v) => v
          ),
      }),
      fishingMan({
        random,
        onFishRetrieved: (fishId: string) => {
          mountSvelteComponent(FishCaughtNotification, { fishId });
        },
      }),
    ];

    return makeSceneType({
      typeName: "fishing",
      events: new Subject(),
      layerOrder,
      objects,
    });
  };
