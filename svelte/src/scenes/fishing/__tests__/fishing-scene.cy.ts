import { z } from "zod";
import { getDebugInfo, type SceneObject } from "../../../model";
import { makeFishingScene } from "../fishing-scene";

// const interactive = Cypress.config("isInteractive");
// These tests don't work in non-interactive mode
const interactive = true;

describe("fishing scene", () => {
  describe("level 0", () => {
    let fisherman: SceneObject | undefined;
    let xpBar: SceneObject | undefined;

    const getXpBarInfo = () => {
      expect(xpBar).to.exist;
      const info = getDebugInfo(
        xpBar!,
        z.object({
          fillFracSpring: z.object({
            position: z.number(),
          }),
          fadeInOpacity: z.number(),
        })
      );

      return info;
    };

    const retrieveFish = (fishId: string) => {
      expect(fisherman).to.exist;
      const info = getDebugInfo(
        fisherman!,
        z.object({
          onFishRetrieved: z.function().args(z.string()),
        })
      );
      info.onFishRetrieved(fishId);
    };

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

    it("does not have xp bar", () => {
      expect(xpBar).to.be.undefined;
    });

    describe("retrieving a fish", () => {
      const fishId = "john";

      beforeEach(() => {
        retrieveFish(fishId);
        cy.interactiveWait(100, interactive);
      });

      it("shows overlay", () => {
        cy.getByTestId("fish-caught-notification")
          .should("be.visible")
          .should("contain.text", "You caught your first fish");
      });

      describe("overlay dismissed", () => {
        beforeEach(() => {
          cy.interactiveWait(100, interactive);
          cy.contains("button", "OK").click();
          cy.myWaitFor(
            () => !!xpBar && getXpBarInfo().fadeInOpacity === 1,
            interactive
          );
        });

        it("xp bar displayed", () => {
          expect(getXpBarInfo().fillFracSpring.position).to.eq(0);
        });

        describe("second fish retrieved", () => {
          beforeEach(() => {
            retrieveFish("fish2");
          });

          it("does not show overlay", () => {
            cy.interactiveWait(100, interactive);
            cy.getByTestId("fish-caught-notification").should("not.exist");
          });

          it("xp bar fills", () => {
            cy.myWaitFor(
              () => getXpBarInfo().fillFracSpring.position > 0,
              interactive
            );
          });

          describe("fishing enough to level up", () => {
            beforeEach(() => {
              retrieveFish("fish3");
              retrieveFish("fish4");
            });

            it("does not show overlay immediately", () => {
              cy.interactiveWait(100, interactive);
              cy.getByTestId("level-up-notification").should("not.exist");
            });

            describe("after xp bar fills", () => {
              beforeEach(() => {
                cy.myWaitFor(
                  () => getXpBarInfo().fillFracSpring.position === 1,
                  interactive
                );
              });

              it("shows level up notification", () => {
                cy.getByTestId("level-up-notification").should(
                  "contain.text",
                  "level 2"
                );
              });

              describe("dismissing overlay", () => {
                beforeEach(() => {
                  cy.interactiveWait(500, interactive);
                  cy.contains("button", "OK").click();
                });

                it("resets xp bar", () => {
                  cy.myWaitFor(
                    () => getXpBarInfo().fillFracSpring.position < 1,
                    interactive
                  );
                });
              });
            });
          });
        });
      });
    });
  });
});
