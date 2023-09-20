import { Subject } from "rxjs";
import {
  PosFns,
  makeSceneObject,
  makeSceneType,
  type ObjectLayerContent,
} from "../../model";
import type { SceneSpec } from "../../model/scene-types";
import { choose } from "../../utils";
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
  ({ random }) => {
    let gotFishId: string | undefined;

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
              gotFishId
                ? {
                    kind: "text",
                    maxWidth: 800,
                    position: PosFns.new(1000, 1020),
                    text: ["You caught fish " + gotFishId],
                  }
                : undefined,
            ],
            (v) => v
          ),
      }),
      fishingMan({
        random,
        onFishRetrieved: (fishId: string) => {
          gotFishId = fishId;
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
