import { z } from "zod";
import type { FishName } from "../../model";
import { filterUndefined } from "../../utils";
import type { TalentId } from "./overlays/Talents/talents";

export const fishingSceneStateSchema = z
  .object({
    level: z.number(),
    levelXp: z.number(),
    nextLevelXp: z.number(),
    totalXp: z.number(),
    caughtFish: z.array(z.string()).readonly(),
    talents: z
      .array(z.string())
      .readonly()
      .transform((s) => s as readonly TalentId[]),
  })
  .readonly();

export type FishingSceneState = z.infer<typeof fishingSceneStateSchema>;

export const initialFishingSceneState: FishingSceneState = {
  level: 1,
  levelXp: 0,
  nextLevelXp: 20,
  totalXp: 0,
  caughtFish: [],
  talents: [],
};

export type FishingSceneNotification = Readonly<
  | {
      kind: "level-up";
      level: number;
    }
  | { kind: "new-fish-type-caught"; fishType: FishName }
>;

export const caughtFish = (
  fishType: FishName,
  state: FishingSceneState
): [FishingSceneState, FishingSceneNotification[]] => {
  const xp = fishType === "rareCandy" ? state.nextLevelXp - state.levelXp : 10;
  const newLevelXp = state.levelXp + xp;
  const newTotalXp = state.totalXp + xp;

  const [caughtFish, newFishNotification] = state.caughtFish.includes(fishType)
    ? ([state.caughtFish, undefined] as const)
    : ([
        [...state.caughtFish, fishType],
        {
          kind: "new-fish-type-caught",
          fishType,
        } as FishingSceneNotification,
      ] as const);

  if (newLevelXp >= state.nextLevelXp) {
    const newState: FishingSceneState = {
      level: state.level + 1,
      levelXp: newLevelXp - state.nextLevelXp,
      nextLevelXp: Math.floor((state.nextLevelXp + 5) * 1.1),
      totalXp: newTotalXp,
      caughtFish,
      talents: state.talents,
    };

    const notification: FishingSceneNotification = {
      kind: "level-up",
      level: newState.level,
    };

    return [newState, filterUndefined([notification, newFishNotification])];
  } else {
    const newState: FishingSceneState = {
      level: state.level,
      levelXp: newLevelXp,
      nextLevelXp: state.nextLevelXp,
      totalXp: newTotalXp,
      caughtFish,
      talents: state.talents,
    };

    return [newState, filterUndefined([newFishNotification])];
  }
};

export const talentsChanged = (
  state: FishingSceneState,
  talents: readonly TalentId[]
): FishingSceneState => {
  return {
    ...state,
    talents,
  };
};
