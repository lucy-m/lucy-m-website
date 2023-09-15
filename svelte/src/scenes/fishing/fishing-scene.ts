import { Subject } from "rxjs";
import type { PRNG } from "seedrandom";
import { PosFns, makeSceneObject, type SceneType } from "../../model";

const layerOrder = ["bg", "debug"] as const;
type LayerKey = (typeof layerOrder)[number];

export const makeFishingScene = (random: PRNG): SceneType<LayerKey> => {
  const makeSceneObjectBound = makeSceneObject(random);

  const objects = [
    makeSceneObjectBound({
      layerKey: "debug",
      getPosition: () => PosFns.new(400, 500),
      getLayers: () => [
        {
          kind: "text",
          maxWidth: 500,
          position: PosFns.zero,
          text: ["debug"],
        },
      ],
    }),
  ];

  return {
    typeName: "fishing",
    events: new Subject(),
    layerOrder,
    objects: objects,
  };
};
