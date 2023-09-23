import { addXp, type FishingSceneState } from "../fishing-scene-state";

describe("fishing scene state", () => {
  const initialState: FishingSceneState = {
    level: 3,
    levelXp: 100,
    nextLevelXp: 150,
    totalXp: 300,
  };

  it("works when no level up", () => {
    const [newState, notification] = addXp(30, initialState);

    expect(newState).to.deep.eq({
      level: 3,
      levelXp: 130,
      nextLevelXp: 150,
      totalXp: 330,
    });

    expect(notification).to.be.undefined;
  });

  it("works when level up", () => {
    const [newState, notification] = addXp(80, initialState);

    expect(newState).to.deep.eq({
      level: 4,
      levelXp: 30,
      nextLevelXp: 176,
      totalXp: 380,
    });

    expect(notification).to.deep.eq({
      kind: "level-up",
    });
  });
});
