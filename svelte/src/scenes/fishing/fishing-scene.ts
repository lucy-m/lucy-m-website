import { Subject } from "rxjs";
import type { PRNG } from "seedrandom";
import {
  PosFns,
  makeSceneObject,
  makeSceneType,
  type SceneType,
} from "../../model";

const layerOrder = ["bg", "debug"] as const;
type LayerKey = (typeof layerOrder)[number];

export const makeFishingScene = (random: PRNG): SceneType => {
  const makeSceneObjectBound = makeSceneObject(random);

  const objects = [
    makeSceneObjectBound(
      (() => {
        const eventSub = new Subject<any>();

        return {
          layerKey: "debug",
          getPosition: () => PosFns.new(400, 500),
          getLayers: () => [
            {
              kind: "text",
              maxWidth: 500,
              position: PosFns.zero,
              text: ["debug"],
            },
            {
              kind: "image",
              assetKey: "birdFlapDown",
              position: PosFns.new(0, 50),
              subLayer: "background",
            },
          ],
          onInteract: () => {
            eventSub.next("Hello");
            return [];
          },
          events$: eventSub,
        };
      })()
    ),
  ];

  objects.forEach((obj) => {
    if (obj.events$) {
      obj.events$.subscribe((val) => {
        console.log("Event value", val);
      });
    }
  });

  return makeSceneType({
    typeName: "fishing",
    events: new Subject(),
    layerOrder,
    objects: objects,
  });
};
