import { doTimes } from "../../../../utils";
import {
  concatStates,
  linearAnimation,
  waitForPointerMove,
  type AnimatingState,
  type ObjectState,
  type StateDone,
  type WaitForPointerMoveState,
} from "../state-machines";

const tickState = <TKind extends string, TState>(
  lastState: ObjectState<TKind, TState> | StateDone
) => {
  if (lastState === "done") {
    throw new Error("State is done");
  }
  if (!lastState || !lastState.tick) {
    throw new Error("State does not have handler for 'tick'");
  }
  return lastState.tick();
};

const onPointerMoveState = <TKind extends string, TState>(
  lastState: ObjectState<TKind, TState> | StateDone
) => {
  if (lastState === "done") {
    throw new Error("State is done");
  }
  if (!lastState || !lastState.onPointerMove) {
    throw new Error("State does not have handler for 'onPointerMove'");
  }
  return lastState.onPointerMove();
};

describe("state machines", () => {
  describe("linearAnimation", () => {
    describe("from 4 to 7 over 6 ticks", () => {
      let lastState: AnimatingState | StateDone;

      beforeEach(() => {
        lastState = linearAnimation({
          stepEnd: 6,
          fromValue: 4,
          toValue: 7,
        });
      });

      it("current is 4", () => {
        expect(lastState).to.haveOwnProperty("kind", "animating");
        expect(lastState).to.haveOwnProperty("current", 4);
      });

      it("does not onPointerMove", () => {
        expect(lastState).not.to.haveOwnProperty("onPointerMove");
      });

      describe("tick", () => {
        beforeEach(() => {
          lastState = tickState(lastState);
        });

        it("current is 4.5", () => {
          expect(lastState).to.haveOwnProperty("kind", "animating");
          expect(lastState).to.haveOwnProperty("current", 4.5);
        });
      });

      describe("ticking to last state", () => {
        beforeEach(() => {
          doTimes(6, () => {
            lastState = tickState(lastState);
          });
        });

        it("current is 7", () => {
          expect(lastState).to.haveOwnProperty("kind", "animating");
          expect(lastState).to.haveOwnProperty("current", 7);
        });

        describe("ticking again", () => {
          beforeEach(() => {
            lastState = tickState(lastState);
          });

          it("state is undefined", () => {
            expect(lastState).to.eq("done");
          });
        });
      });
    });
  });

  describe("waitForPointerMoveState", () => {
    let lastState: WaitForPointerMoveState | StateDone;

    beforeEach(() => {
      lastState = waitForPointerMove();
    });

    it("has correct properties", () => {
      expect(lastState).to.haveOwnProperty("kind", "wait-for-pom");
      expect(lastState).not.to.haveOwnProperty("tick");
    });

    describe("onPointerMove", () => {
      beforeEach(() => {
        lastState = onPointerMoveState(lastState);
      });

      it("is done", () => {
        expect(lastState).to.equal("done");
      });
    });
  });

  describe("concat", () => {
    describe("two animating states", () => {
      const state1 = linearAnimation({
        stepEnd: 1,
        fromValue: 0,
        toValue: 2,
      });

      const state2 = linearAnimation({
        stepEnd: 2,
        fromValue: 10,
        toValue: 12,
      });

      const initial = concatStates(state1, state2);
      let entries: number[];

      beforeEach(() => {
        entries = [];

        let lastResult: AnimatingState | StateDone = initial;

        for (let i = 0; i < 10; i++) {
          if (lastResult === "done") {
            break;
          }
          entries.push(lastResult.current);
          lastResult = tickState(lastResult);
        }

        if (lastResult !== "done") {
          throw new Error("State has not finished iterating");
        }
      });

      it("has correct values", () => {
        expect(entries).to.deep.equal([0, 2, 10, 11, 12]);
      });
    });

    describe("wait-for-pom then animating", () => {
      const state1 = waitForPointerMove();

      const state2 = linearAnimation({
        stepEnd: 1,
        fromValue: 0,
        toValue: 2,
      });

      const initial = concatStates(state1, state2);

      it("has no tick", () => {
        expect(initial.tick).to.be.undefined;
      });

      describe("onPointerMove", () => {
        let result: ReturnType<typeof onPointerMoveState>;

        beforeEach(() => {
          result = onPointerMoveState(initial);
        });

        it("has animating state", () => {
          expect(result).to.haveOwnProperty("kind", "animating");
          expect(result).to.haveOwnProperty("current", 0);
        });

        it("has tick", () => {
          expect(result).to.haveOwnProperty("tick");
        });

        it("has no pointerMove", () => {
          expect(result).not.to.haveOwnProperty("onPointerMove");
        });
      });
    });
  });
});
