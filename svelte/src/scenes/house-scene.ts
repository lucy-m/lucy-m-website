import { Subject } from "rxjs";
import type { PRNG } from "seedrandom";
import {
  makeSceneObject,
  makeSceneType,
  PosFns,
  type SceneObject,
  type SceneSpec,
} from "../model";
import { makeFishingScene } from "./fishing";

const layerOrder = ["bg", "house"] as const;

export const makeHouseScene: SceneSpec = (random: PRNG) => {
  const makeSceneObjectBound = makeSceneObject(random);

  const objects: SceneObject[] = [
    makeSceneObjectBound({
      layerKey: "house",
      getPosition: () => PosFns.new(1200, 500),
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
      onInteract: () => [{ kind: "changeScene", newScene: makeFishingScene() }],
    }),
  ];

  return makeSceneType({
    typeName: "house-scene",
    objects,
    layerOrder,
    events: new Subject(),
  });
};
