import { BehaviorSubject, Observable, map, pairwise } from "rxjs";
import { PosFns, makeSceneObject, makeSceneType } from "../../model";
import type { SceneEventOrAction, SceneSpec } from "../../model/scene-types";
import { choose } from "../../utils";
import { chooseOp } from "../../utils/choose-op";
import {
  addXp,
  initialFishingSceneState,
  type FishingSceneState,
} from "./fishing-scene-state";
import { fishingMan } from "./objects/fisherman";
import { makeXpBar } from "./objects/xp-bar";
import { FirstFishNotification, LevelUpNotification } from "./overlays";

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
    let showLevelUpNotification: number | undefined;

    const stateSub = new BehaviorSubject<FishingSceneState | undefined>(
      undefined
    );
    const xpBarProgress$ = stateSub.pipe(
      pairwise(),
      map(([prevState, nextState]) => {
        if (nextState === undefined) {
          return 0;
        } else if (
          prevState !== undefined &&
          nextState.level > prevState.level
        ) {
          return 1;
        } else {
          return nextState.levelXp / nextState.nextLevelXp;
        }
      })
    );

    const onStationary = () => {
      if (showLevelUpNotification !== undefined) {
        mountSvelteComponent(LevelUpNotification, {
          newLevel: showLevelUpNotification,
        });
        showLevelUpNotification = undefined;
      }
    };

    const xpBar = makeXpBar({
      random,
      fillFrac$: xpBarProgress$,
      onStationary,
    });

    const events$: Observable<SceneEventOrAction> = stateSub.pipe(
      pairwise(),
      chooseOp(([previous, next]) => {
        if (!previous && next) {
          return {
            kind: "addObject",
            makeObject: () => xpBar,
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
              mountSvelteComponent(FirstFishNotification, {});
              stateSub.next(initialFishingSceneState);
            } else {
              const [nextState, notification] = addXp(10, stateSub.value);
              stateSub.next(nextState);

              if (notification) {
                showLevelUpNotification = nextState.level;
              }
            }
          },
        }),
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
