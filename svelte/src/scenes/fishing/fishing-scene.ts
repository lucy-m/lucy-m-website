import { Subject } from "rxjs";
import { PosFns, makeSceneObject, makeSceneType } from "../../model";
import type { SceneSpec } from "../../model/scene-types";
import FishCaughtNotification from "./FishCaughtNotification.svelte";
import { fishingMan } from "./objects/fisherman";
import { makeXpBar } from "./objects/xp-bar";

const layerOrder = [
  "bg",
  "man",
  "bobber",
  "bite-marker",
  "fish",
  "xp-bar",
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
        getLayers: () => [
          {
            kind: "image",
            assetKey: "fishingBackground",
            subLayer: "background",
          },
        ],
      }),
      fishingMan({
        random,
        onFishRetrieved: (fishId: string) => {
          mountSvelteComponent(FishCaughtNotification, { fishId });
        },
      }),
      makeXpBar(random),
    ];

    return makeSceneType({
      typeName: "fishing",
      events: new Subject(),
      layerOrder,
      objects,
    });
  };
