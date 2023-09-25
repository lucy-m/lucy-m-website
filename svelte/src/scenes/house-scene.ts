import { Subject } from "rxjs";
import {
  makeSceneObject,
  makeSceneType,
  PosFns,
  type SceneObject,
  type SceneSpec,
} from "../model";
import { makeFishingScene } from "./fishing";
import HouseSceneTest from "./HouseSceneTest.svelte";

const layerOrder = ["bg", "house"] as const;

export const makeHouseScene: SceneSpec = ({ random, mountSvelteComponent }) => {
  const makeSceneObjectBound = makeSceneObject(random);

  const objects: SceneObject[] = [
    makeSceneObjectBound({
      layerKey: "house",
      getPosition: () => PosFns.new(1200, 500),
      getLayers: () => [
        {
          kind: "image",
          assetKey: "houseSmall",
        },
        {
          kind: "text",
          maxWidth: 650,
          position: PosFns.new(-500, -200),
          text: ["There is gonna be something good here I promise"],
        },
      ],
      onInteract: () => {
        mountSvelteComponent(HouseSceneTest, { value: "" + random.int32() });
      },
    }),
    makeSceneObjectBound({
      layerKey: "house",
      getPosition: () => PosFns.new(800, 500),
      getLayers: () => [
        {
          kind: "image",
          assetKey: "fish1",
        },
      ],
      onInteract: () => [
        { kind: "changeScene", newScene: makeFishingScene(undefined) },
      ],
    }),
  ];

  return makeSceneType({
    typeName: "house-scene",
    objects,
    layerOrder,
    events: new Subject(),
  });
};
