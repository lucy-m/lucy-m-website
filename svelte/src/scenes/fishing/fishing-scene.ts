import {
  BehaviorSubject,
  Observable,
  Subject,
  combineLatest,
  concatMap,
  first,
  map,
  pairwise,
} from "rxjs";
import type { SceneEventOrAction, SceneSpec } from "../../model";
import { PosFns, makeSceneObject, makeSceneType } from "../../model";
import { chooseOp, filterUndefined } from "../../utils";
import {
  addXp,
  initialFishingSceneState,
  type FishingSceneNotification,
  type FishingSceneState,
} from "./fishing-scene-state";
import { fishingMan, makeXpBar } from "./objects";
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
  (initialState: FishingSceneState | undefined): SceneSpec =>
  ({ random, mountSvelteComponent }) => {
    const makeSceneObjectBound = makeSceneObject(random);

    const stateSub = new BehaviorSubject<FishingSceneState | undefined>(
      initialState
    );
    const levelUpSub = new BehaviorSubject<
      FishingSceneNotification | undefined
    >(undefined);
    const stationaryXpBar = new Subject<void>();

    const xpBarProgress$ = combineLatest([stateSub, levelUpSub]).pipe(
      map(([nextState, levelUpNotification]) => {
        if (nextState === undefined) {
          return 0;
        } else if (levelUpNotification) {
          return 1;
        } else {
          return nextState.levelXp / nextState.nextLevelXp;
        }
      })
    );

    const sub = levelUpSub
      .pipe(
        concatMap((value) =>
          stationaryXpBar.pipe(
            map(() => value),
            first()
          )
        )
      )
      .subscribe((notification) => {
        if (notification !== undefined) {
          mountSvelteComponent(LevelUpNotification, {
            newLevel: notification.level,
            onClosed: () => levelUpSub.next(undefined),
          });
        }
      });

    const onStationary = () => {
      stationaryXpBar.next();
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

    const objects = filterUndefined([
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
              levelUpSub.next(notification);
            }
          }
        },
      }),
      stateSub.value !== undefined ? xpBar : undefined,
    ]);

    return makeSceneType({
      typeName: "fishing",
      events: events$,
      layerOrder,
      objects,
      onDestroy: () => sub.unsubscribe(),
    });
  };
