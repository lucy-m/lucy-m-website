import {
  caughtFish,
  type FishingSceneNotification,
  type FishingSceneState,
} from "../fishing-scene-state";

describe("fishing scene state", () => {
  describe("caughtFish", () => {
    describe("existing fish", () => {
      describe("no level up", () => {
        const initialState: FishingSceneState = {
          level: 3,
          levelXp: 100,
          nextLevelXp: 150,
          totalXp: 300,
          caughtFish: ["commonBrown"],
          talents: [],
        };

        const [newState, notification] = caughtFish(
          "commonBrown",
          initialState
        );

        it("has correct state", () => {
          const expected: FishingSceneState = {
            level: 3,
            levelXp: 110,
            nextLevelXp: 150,
            totalXp: 310,
            caughtFish: ["commonBrown"],
            talents: [],
          };

          expect(newState).to.deep.eq(expected);
        });

        it("has correct notification", () => {
          expect(notification).to.be.empty;
        });
      });

      describe("level up", () => {
        const initialState: FishingSceneState = {
          level: 3,
          levelXp: 105,
          nextLevelXp: 110,
          totalXp: 300,
          caughtFish: ["commonBrown"],
          talents: [],
        };

        const [newState, notification] = caughtFish(
          "commonBrown",
          initialState
        );

        it("has correct state", () => {
          const expected: FishingSceneState = {
            level: 4,
            levelXp: 5,
            nextLevelXp: 132,
            totalXp: 310,
            caughtFish: ["commonBrown"],
            talents: [],
          };

          expect(newState).to.deep.eq(expected);
        });

        it("has correct notification", () => {
          const expected: FishingSceneNotification[] = [
            {
              kind: "level-up",
              level: 4,
            },
          ];

          expect(notification).to.deep.eq(expected);
        });
      });
    });

    describe("new fish", () => {
      describe("no level up", () => {
        const initialState: FishingSceneState = {
          level: 3,
          levelXp: 100,
          nextLevelXp: 150,
          totalXp: 300,
          caughtFish: ["commonBrown"],
          talents: [],
        };

        const [newState, notification] = caughtFish("commonGrey", initialState);

        it("has correct state", () => {
          const expected: FishingSceneState = {
            level: 3,
            levelXp: 110,
            nextLevelXp: 150,
            totalXp: 310,
            caughtFish: ["commonBrown", "commonGrey"],
            talents: [],
          };

          expect(newState).to.deep.eq(expected);
        });

        it("has correct notification", () => {
          const expected: FishingSceneNotification[] = [
            {
              kind: "new-fish-type-caught",
              fishType: "commonGrey",
            },
          ];

          expect(notification).to.deep.eq(expected);
        });
      });

      describe("level up", () => {
        const initialState: FishingSceneState = {
          level: 3,
          levelXp: 105,
          nextLevelXp: 110,
          totalXp: 300,
          caughtFish: ["commonBrown"],
          talents: [],
        };

        const [newState, notification] = caughtFish("commonGrey", initialState);

        it("has correct state", () => {
          const expected: FishingSceneState = {
            level: 4,
            levelXp: 5,
            nextLevelXp: 132,
            totalXp: 310,
            caughtFish: ["commonBrown", "commonGrey"],
            talents: [],
          };

          expect(newState).to.deep.eq(expected);
        });

        it("has correct notification", () => {
          const expected: FishingSceneNotification[] = [
            {
              kind: "level-up",
              level: 4,
            },
            {
              kind: "new-fish-type-caught",
              fishType: "commonGrey",
            },
          ];

          expect(notification).to.deep.eq(expected);
        });
      });
    });
  });
});
