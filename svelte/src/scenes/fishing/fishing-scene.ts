import { Subject, map, scan, share, startWith } from "rxjs";
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

    let firstFish = true;

    const addXp = new Subject<number>();

    const xp$ = addXp.pipe(
      scan((acc, add) => acc + add, 0),
      startWith(0),
      share()
    );

    const xpBarProgress$ = xp$.pipe(map((xp) => (xp % 100) / 100));

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
          if (firstFish) {
            mountSvelteComponent(FishCaughtNotification, {});
            firstFish = false;
          }
          addXp.next(34);
        },
      }),
      makeXpBar({ random, fillFrac$: xpBarProgress$ }),
    ];

    return makeSceneType({
      typeName: "fishing",
      events: new Subject(),
      layerOrder,
      objects,
    });
  };
