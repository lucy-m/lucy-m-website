import {
  BehaviorSubject,
  Observable,
  Subject,
  combineLatest,
  concatMap,
  first,
  from,
  map,
  mergeMap,
  pairwise,
} from "rxjs";
import type { FishName, SceneEventOrAction, SceneSpec } from "../../model";
import { PosFns, makeSceneObject, makeSceneType } from "../../model";
import { chooseOp, filterUndefined, partitionByAllKinds } from "../../utils";
import { sceneSize } from "../scene-size";
import {
  caughtFish,
  fishingSceneStateSchema,
  initialFishingSceneState,
  talentsChanged,
  type FishingSceneNotification,
  type FishingSceneState,
} from "./fishing-scene-state";
import { fishingMan, makeXpBar } from "./objects";
import { makeTalentMenuIcon } from "./objects/talent-menu-icon";
import {
  FirstFishNotification,
  GameMenu,
  LevelUpNotification,
  NewFishCaught,
} from "./overlays";
import { TalentsOverlay } from "./overlays/Talents";
import type { TalentId } from "./overlays/Talents/talents";

const layerOrder = [
  "bg",
  "pond",
  "man",
  "bobber",
  "bite-marker",
  "fish",
  "xp-bar",
  "reeling",
  "ui",
  "debug",
] as const;

export const makeFishingScene =
  (args: {
    initialState: FishingSceneState | undefined;
    onStateChange: (state: FishingSceneState | undefined) => void;
  }): SceneSpec =>
  ({ random, mountSvelteComponent }) =>
  (images, onSceneChange) => {
    const makeSceneObjectBound = makeSceneObject(random);

    const stateSub = new BehaviorSubject<FishingSceneState | undefined>(
      args.initialState
    );
    const levelUpSub = new BehaviorSubject<
      Extract<FishingSceneNotification, { kind: "level-up" }> | undefined
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

    sub.add(
      stateSub.subscribe((newState) => {
        args.onStateChange(newState);
      })
    );

    const onStationary = () => {
      stationaryXpBar.next();
    };

    const xpBar = makeXpBar({
      random,
      fillFrac$: xpBarProgress$,
      onStationary,
    });

    const talentMenuIcon = makeTalentMenuIcon({
      random,
      state$: stateSub,
      openTalentMenu: (state) => {
        mountSvelteComponent(TalentsOverlay, {
          images,
          learned: state.talents,
          totalTalentPoints: state.level - 1,
          onClosed: (talents: readonly TalentId[]) => {
            stateSub.next(talentsChanged(stateSub.value ?? state, talents));
          },
        });
      },
    });

    const events$: Observable<SceneEventOrAction> = stateSub.pipe(
      pairwise(),
      chooseOp(([previous, next]) => {
        if (!previous && next) {
          return [
            {
              kind: "addObject",
              makeObject: () => xpBar,
            },
            {
              kind: "addObject",
              makeObject: () => talentMenuIcon,
            },
          ] as SceneEventOrAction[];
        } else {
          return undefined;
        }
      }),
      mergeMap((v) => from(v))
    );

    const objects = filterUndefined([
      makeSceneObjectBound({
        layerKey: "bg",
        getPosition: () => PosFns.zero,
        getLayers: () => [
          {
            kind: "image",
            assetKey: "fishingBackground",
          },
        ],
      }),
      fishingMan({
        random,
        onFishRetrieved: (fishType: FishName) => {
          if (stateSub.value === undefined) {
            mountSvelteComponent(FirstFishNotification, {});
            stateSub.next(initialFishingSceneState);
          } else {
            const [nextState, notifications] = caughtFish(
              fishType,
              stateSub.value
            );
            stateSub.next(nextState);

            const byKind = partitionByAllKinds(notifications);

            const levelUp = byKind["level-up"]?.[0];
            if (levelUp) {
              levelUpSub.next(levelUp);
            }

            const newFishType = byKind["new-fish-type-caught"]?.[0];
            if (newFishType) {
              mountSvelteComponent(NewFishCaught, {
                fishType: newFishType.fishType,
              });
            }
          }
        },
        getCurrentLevel: () => stateSub.value?.level ?? 0,
        getTalents: () => stateSub.value?.talents ?? [],
      }),
      makeSceneObjectBound({
        layerKey: "ui",
        typeName: "game-menu",
        getPosition: () => PosFns.new(sceneSize.x - 140, sceneSize.y - 140),
        getLayers: () => [
          {
            kind: "image",
            assetKey: "openGameMenuIcon",
          },
        ],
        onInteract: () => {
          mountSvelteComponent(GameMenu, {
            state: stateSub.value,
            resetState: () => stateSub.next(undefined),
          });
        },
      }),
      stateSub.value !== undefined ? talentMenuIcon : undefined,
      stateSub.value !== undefined ? xpBar : undefined,
    ]);

    return makeSceneType({
      typeName: "fishing",
      events: events$,
      layerOrder,
      objects,
      onDestroy: () => sub.unsubscribe(),
    })(images, onSceneChange);
  };

export const makeFishingSceneWithLocalStorage: SceneSpec = (() => {
  const storageKey = "fishing-game-state";

  const initialState: FishingSceneState | undefined = (() => {
    const storageValue = localStorage.getItem(storageKey);

    if (!storageValue) {
      return undefined;
    }

    const jsonObject = JSON.parse(storageValue);
    const parsed = fishingSceneStateSchema.safeParse(jsonObject);

    if (parsed.success) {
      return parsed.data;
    } else {
      return undefined;
    }
  })();

  const onStateChange = (state: FishingSceneState | undefined) => {
    if (state === undefined) {
      localStorage.removeItem(storageKey);
    } else {
      const jsonObject = JSON.stringify(state);
      localStorage.setItem(storageKey, jsonObject);
    }
  };

  return makeFishingScene({
    initialState,
    onStateChange,
  });
})();
