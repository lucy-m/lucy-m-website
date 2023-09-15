import { Subject } from "rxjs";
import type { PRNG } from "seedrandom";
import type { SceneTypeStateless } from "../model";
import {
  makeSceneObjectStateless,
  makeSceneTypeStateless,
  PosFns,
  type SceneObject,
} from "../model";

const layerOrder = ["bg", "house"] as const;
type LayerKey = (typeof layerOrder)[number];

export const makeHouseScene = (random: PRNG): SceneTypeStateless<LayerKey> => {
  const makeSceneObjectBound = makeSceneObjectStateless(random);

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

  return makeSceneTypeStateless({
    typeName: "house-scene",
    objects,
    layerOrder,
    events: new Subject(),
  });
};
