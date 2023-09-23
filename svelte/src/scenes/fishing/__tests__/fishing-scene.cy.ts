import type { SceneObject } from "../../../model";
import { makeFishingScene } from "../fishing-scene";

const interactive = Cypress.config("isInteractive");
// const interactive = false;

describe("fishing scene", () => {
  describe("rendering tests", () => {
    let fisherman: SceneObject | undefined;
    let xpBar: SceneObject | undefined;

    beforeEach(() => {
      if (!interactive) {
        cy.clock();
      }
    });

    beforeEach(() => {
      cy.viewport(1400, 900);

      cy.mountViewScene({
        sceneSpec: makeFishingScene(),
        seed: "abcd",
        onSceneChange: (scene) => {
          fisherman = scene
            .getObjects()
            .find((obj) => obj.typeName === "fisherman");

          xpBar = scene.getObjects().find((obj) => obj.typeName === "xp-bar");
        },
      });
    });

    it("works", () => {});

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

      it.only("xp bar fills after overlay dismissed", () => {
        const getXpBarPosition = () => {
          expect(xpBar?._getDebugInfo).to.exist;

          const debugInfo = xpBar!._getDebugInfo!();
          const fillFracSpring = debugInfo?.fillFracSpring;

          expect(typeof fillFracSpring?.position).to.eq("number");

          return fillFracSpring!.position as number;
        };

        cy.interactiveWait(100, interactive);
        expect(getXpBarPosition()).to.eq(0);

        cy.contains("button", "OK").click();

        cy.myWaitFor(() => getXpBarPosition() > 0, interactive);
      });
    });
  });
});
