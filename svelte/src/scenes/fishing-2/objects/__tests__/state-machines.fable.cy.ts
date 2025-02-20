import {
  linearAnimation,
  ObjectState,
  Payload_Animating,
} from "../../../../fable/StateMachine";

describe("state machines (fable)", () => {
  describe("linearAnimation", () => {
    let lastState: ObjectState;

    beforeEach(() => {
      lastState = linearAnimation("a", 6, 4, 7);
    });

    it("has correct initial state", () => {
      expect(lastState.id).to.equal("a");
      expect(lastState.onPointerMove).to.be.undefined;
      expect(lastState.payload).to.deep.equal(Payload_Animating(4));
    });
  });
});
