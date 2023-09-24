export type FishingSceneState = Readonly<{
  level: number;
  levelXp: number;
  nextLevelXp: number;
  totalXp: number;
}>;

export const initialFishingSceneState: FishingSceneState = {
  level: 1,
  levelXp: 0,
  nextLevelXp: 30,
  totalXp: 0,
};

export type FishingSceneNotification = Readonly<{
  kind: "level-up";
  level: number;
}>;

export const addXp = (
  xp: number,
  state: FishingSceneState
): [FishingSceneState, FishingSceneNotification | undefined] => {
  const newLevelXp = state.levelXp + xp;
  const newTotalXp = state.totalXp + xp;

  if (newLevelXp >= state.nextLevelXp) {
    const newState: FishingSceneState = {
      level: state.level + 1,
      levelXp: newLevelXp - state.nextLevelXp,
      nextLevelXp: Math.floor((state.nextLevelXp + 10) * 1.1),
      totalXp: newTotalXp,
    };
    const notification: FishingSceneNotification = {
      kind: "level-up",
      level: newState.level,
    };

    return [newState, notification];
  } else {
    const newState: FishingSceneState = {
      level: state.level,
      levelXp: newLevelXp,
      nextLevelXp: state.nextLevelXp,
      totalXp: newTotalXp,
    };

    return [newState, undefined];
  }
};
