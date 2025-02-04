import { doTimes } from "../../../../utils";
import {
  concatStates,
  linearAnimation,
  waitForEvent,
  type ObjectState,
  type StateDone,
} from "../state-machines";

const tickState = (lastState: ObjectState | StateDone) => {
  if (lastState === "done") {
    throw new Error("State is done");
  }
  if (!lastState || !lastState.tick) {
    throw new Error("State does not have handler for 'tick'");
  }
  return lastState.tick();
};

const onPointerMoveState = (lastState: ObjectState | StateDone) => {
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
      let lastState: ObjectState | StateDone;

      beforeEach(() => {
        lastState = linearAnimation({
          id: "xy",
          stepEnd: 6,
          fromValue: 4,
          toValue: 7,
        });
      });

      it("has correct properties", () => {
        expect(lastState).to.haveOwnProperty("kind", "animating");
        expect(lastState).to.haveOwnProperty("current", 4);
        expect(lastState).to.haveOwnProperty("id", "xy");

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

  describe("waitForEvent pointerMove state", () => {
    let lastState: ObjectState | StateDone;

    beforeEach(() => {
      lastState = waitForEvent("pointerMove", { id: "abc" });
    });

    it("has correct properties", () => {
      expect(lastState).to.haveOwnProperty("kind", "wait-for-event");
      expect(lastState).to.haveOwnProperty("id", "abc");
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

      let entries: number[];

      beforeEach(() => {
        const initial = concatStates([state1, state2]);
        entries = [];

        let lastResult: ObjectState | StateDone = initial;

        for (let i = 0; i < 10; i++) {
          if (lastResult === "done") {
            break;
          }
          if (lastResult.kind !== "animating") {
            throw new Error("Unexpected state type " + lastResult.kind);
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

    describe("wait-for-event then animating", () => {
      const state1 = waitForEvent("pointerMove", { id: "wait" });

      const state2 = linearAnimation({
        id: "animate",
        stepEnd: 1,
        fromValue: 0,
        toValue: 2,
      });

      let initial: ObjectState;

      beforeEach(() => {
        initial = concatStates([state1, state2]);
      });

      it("has no tick", () => {
        expect(initial.tick).to.be.undefined;
      });

      describe("emitting event", () => {
        let result: ReturnType<typeof onPointerMoveState>;

        beforeEach(() => {
          result = onPointerMoveState(initial);
          console.log("Got result", result);
        });

        it("has animating state", () => {
          expect(result).to.haveOwnProperty("kind", "animating");
          expect(result).to.haveOwnProperty("current", 0);
        });

        it("has tick", () => {
          expect(result).to.haveOwnProperty("tick");
        });

        it("has no pointerMove", () => {
          expect(result).to.haveOwnProperty("onPointerMove", undefined);
        });
      });
    });

    describe("multiple wait-for-event", () => {
      const state1 = waitForEvent("pointerMove", { id: "1" });
      const state2 = waitForEvent("pointerMove", { id: "2" });
      const state3 = waitForEvent("pointerMove", { id: "3" });

      let initial: ObjectState;
      let after1: ObjectState | StateDone;
      let after2: ObjectState | StateDone;
      let after3: ObjectState | StateDone;

      beforeEach(() => {
        initial = concatStates([state1, state2, state3]);
        after1 = onPointerMoveState(initial);
        after2 = onPointerMoveState(after1);
        after3 = onPointerMoveState(after2);
      });

      it("has correct initial state", () => {
        expect(initial).to.haveOwnProperty("id", "1");
      });

      it("has correct state after 1 event", () => {
        expect(after1).not.to.equal("done");
        expect(after1).to.haveOwnProperty("id", "2");
      });

      it("has correct correct state after 2 events", () => {
        expect(after2).not.to.equal("done");
        expect(after2).to.haveOwnProperty("id", "3");
      });

      it("is done after 3 events", () => {
        expect(after3).to.equal("done");
      });
    });
  });
});
