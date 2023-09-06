import { Subject } from "rxjs";
import type { PRNG } from "seedrandom";
import {
  makeSceneObject,
  PosFns,
  type SceneObject,
  type SceneType,
} from "../model";

const layerOrder = ["bg", "house"] as const;
type LayerKey = (typeof layerOrder)[number];

export const makeHouseScene = (random: PRNG): SceneType<LayerKey> => {
  const makeSceneObjectBound = makeSceneObject(random);

  const objects: SceneObject<LayerKey, any>[] = [
    makeSceneObjectBound({
      layerKey: "house",
      position: PosFns.new(1200, 500),
      getLayers: () => [
        {
          kind: "image",
          assetKey: "houseSmall",
          subLayer: "background",
        },
        {
          kind: "text",
          maxWidth: 650,
          position: PosFns.new(-500, -200),
          text: ["There is gonna be something good here I promise"],
        },
      ],
    }),
  ];

  return {
    typeName: "house-scene",
    objects,
    layerOrder,
    events: new Subject(),
  };
};
