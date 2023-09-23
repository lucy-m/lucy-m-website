import type { SceneObject } from "../../../model";
import { makeFishingScene } from "../fishing-scene";

describe("fishing scene", () => {
  describe("rendering tests", () => {
    let fisherman: SceneObject | undefined;

    beforeEach(() => {
      cy.viewport(1400, 900);

      cy.mountViewScene({
        sceneSpec: makeFishingScene(),
        seed: "abcd",
        onSceneChange: (scene) => {
          fisherman = scene
            .getObjects()
            .find((obj) => obj.typeName === "fisherman");
        },
      });
    });

    it.only("works", () => {});

    describe("retrieving a fish", () => {
      const fishId = "john";

      beforeEach(() => {
        expect(fisherman?._getDebugInfo).to.exist;

        const debugInfo = fisherman!._getDebugInfo!();

        expect(typeof debugInfo.onFishRetrieved).to.eq("function");

        debugInfo.onFishRetrieved(fishId);
      });

      it("shows overlay", () => {
        cy.getByTestId("fish-caught-notification")
          .should("be.visible")
          .should("contain.text", "You caught fish john!");
      });
    });
  });
});
