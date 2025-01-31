import { doTimes } from "../../../../utils";
import { linearAnimation, type AnimatingState } from "../state-machines";

describe("linearAnimation", () => {
  describe("from 4 to 7 over 6 ticks", () => {
    let state: AnimatingState | undefined;

    beforeEach(() => {
      state = linearAnimation({
        stepEnd: 6,
        fromValue: 4,
        toValue: 7,
      });
    });

    it("currentValue is 4", () => {
      expect(state).to.haveOwnProperty("kind", "animating");
      expect(state).to.haveOwnProperty("currentValue", 4);
    });

    describe("tick", () => {
      beforeEach(() => {
        state = state?.tick();
      });

      it("currentValue is 4.5", () => {
        expect(state).to.haveOwnProperty("kind", "animating");
        expect(state).to.haveOwnProperty("currentValue", 4.5);
      });
    });

    describe("ticking to last state", () => {
      beforeEach(() => {
        doTimes(6, () => {
          state = state?.tick();
        });
      });

      it("currentValue is 7", () => {
        expect(state).to.haveOwnProperty("kind", "animating");
        expect(state).to.haveOwnProperty("currentValue", 7);
      });

      describe("ticking again", () => {
        beforeEach(() => {
          state = state?.tick();
        });

        it("state is undefined", () => {
          expect(state).to.be.undefined;
        });
      });
    });
  });
});
