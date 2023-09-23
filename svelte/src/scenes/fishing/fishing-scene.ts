import { BehaviorSubject, Observable, map, pairwise } from "rxjs";
import { PosFns, makeSceneObject, makeSceneType } from "../../model";
import type { SceneEventOrAction, SceneSpec } from "../../model/scene-types";
import { choose } from "../../utils";
import { chooseOp } from "../../utils/choose-op";
import FishCaughtNotification from "./FishCaughtNotification.svelte";
import {
  addXp,
  initialFishingSceneState,
  type FishingSceneState,
} from "./fishing-scene-state";
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

    const stateSub = new BehaviorSubject<FishingSceneState | undefined>(
      undefined
    );
    const xpBarProgress$ = stateSub.pipe(
      map((state) =>
        state === undefined ? 0 : state.levelXp / state.nextLevelXp
      )
    );

    const events$: Observable<SceneEventOrAction> = stateSub.pipe(
      pairwise(),
      chooseOp(([previous, next]) => {
        if (!previous && next) {
          return {
            kind: "addObject",
            makeObject: () => makeXpBar({ random, fillFrac$: xpBarProgress$ }),
          } as SceneEventOrAction;
        } else {
          return undefined;
        }
      })
    );

    const objects = choose(
      [
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
            if (stateSub.value === undefined) {
              mountSvelteComponent(FishCaughtNotification, {});
              stateSub.next(initialFishingSceneState);
            } else {
              const [nextState, notification] = addXp(10, stateSub.value);
              stateSub.next(nextState);
            }
          },
        }),
        stateSub.value && makeXpBar({ random, fillFrac$: xpBarProgress$ }),
      ],
      (v) => v
    );

    return makeSceneType({
      typeName: "fishing",
      events: events$,
      layerOrder,
      objects,
    });
  };
