import fc, { oneof } from "fast-check";
import {
  fishingSceneReducer,
  type AnyFishingAction,
  type AnyFishingState,
  type FishingAction,
  type FishingState,
} from "../fishing-state";

const idleStateArb: fc.Arbitrary<FishingState<"idle">> = (() => {
  return fc.record({ kind: fc.constant("idle" as const) });
})();

const castOutStateArb: fc.Arbitrary<FishingState<"cast-out">> = (() => {
  return fc.record({ kind: fc.constant("cast-out" as const) });
})();

const gotABiteStateArb: fc.Arbitrary<FishingState<"got-a-bite">> = (() => {
  return fc.record({
    kind: fc.constant("got-a-bite" as const),
    fishId: fc.string(),
  });
})();

const reelingStateArb: fc.Arbitrary<FishingState<"reeling">> = (() => {
  return fc.record({
    kind: fc.constant("reeling" as const),
    fishId: fc.string(),
  });
})();

const anyFishingStateArb: fc.Arbitrary<AnyFishingState> = (() => {
  return oneof(
    idleStateArb,
    castOutStateArb,
    gotABiteStateArb,
    reelingStateArb
  );
})();

const castOutArb: fc.Arbitrary<FishingAction<"cast-out">> = fc.record({
  kind: fc.constant("cast-out" as const),
});

const fishBiteArb: fc.Arbitrary<FishingAction<"fish-bite">> = fc.record({
  kind: fc.constant("fish-bite" as const),
  fishId: fc.string(),
});

const startReelArb: fc.Arbitrary<FishingAction<"start-reel">> = fc.record({
  kind: fc.constant("start-reel" as const),
});

const finishReelArb: fc.Arbitrary<FishingAction<"finish-reel">> = fc.record({
  kind: fc.constant("finish-reel" as const),
});

const runActionStatePbt = <
  TAct extends AnyFishingAction,
  TState extends AnyFishingState
>(
  actionArb: fc.Arbitrary<TAct>,
  stateArb: fc.Arbitrary<TState>,
  assert: (args: {
    action: TAct;
    initialState: TState;
    result: AnyFishingState;
  }) => void
): void => {
  fc.assert(
    fc.property(actionArb, stateArb, (action, initialState) => {
      cy.log(JSON.stringify(action))
        .log(JSON.stringify(initialState))
        .then(() => {
          const result = fishingSceneReducer(action, initialState);

          assert({ action, initialState, result });
        });
    })
  );
};

describe("scene-state", () => {
  describe("cast-out action", () => {
    it("changes idle to cast-out", () => {
      runActionStatePbt(castOutArb, idleStateArb, ({ result }) => {
        expect(result).to.deep.equal({ kind: "cast-out" });
      });
    });

    it("does nothing for non-idle state", () => {
      runActionStatePbt(
        castOutArb,
        anyFishingStateArb.filter(({ kind }) => kind !== "idle"),
        ({ initialState, result }) => {
          expect(result).to.eq(initialState);
        }
      );
    });
  });

  describe("fish-bite action", () => {
    it("cast-out state changes to got-a-bite with matching fishId", () => {
      runActionStatePbt(fishBiteArb, castOutStateArb, ({ action, result }) => {
        expect(result).to.deep.equal({
          kind: "got-a-bite",
          fishId: action.fishId,
        });
      });
    });

    it("does nothing for other states", () => {
      runActionStatePbt(
        fishBiteArb,
        anyFishingStateArb.filter(({ kind }) => kind !== "cast-out"),
        ({ initialState, result }) => {
          expect(result).to.eq(initialState);
        }
      );
    });
  });

  describe("start-reel action", () => {
    it("got-a-bite state changes to reeling state with matching fishId", () => {
      runActionStatePbt(
        startReelArb,
        gotABiteStateArb,
        ({ initialState, result }) => {
          expect(result).to.deep.equal({
            kind: "reeling",
            fishId: initialState.fishId,
          });
        }
      );
    });

    it("does nothing for other states", () => {
      runActionStatePbt(
        startReelArb,
        anyFishingStateArb.filter(({ kind }) => kind !== "got-a-bite"),
        ({ initialState, result }) => {
          expect(result).to.eq(initialState);
        }
      );
    });
  });

  describe("finish-reel action", () => {
    it("reeling state changes to idle state with matching fishId", () => {
      runActionStatePbt(finishReelArb, reelingStateArb, ({ result }) => {
        expect(result).to.deep.equal({
          kind: "idle",
        });
      });
    });

    it("does nothing for other states", () => {
      runActionStatePbt(
        finishReelArb,
        anyFishingStateArb.filter(({ kind }) => kind !== "reeling"),
        ({ initialState, result }) => {
          expect(result).to.eq(initialState);
        }
      );
    });
  });
});
