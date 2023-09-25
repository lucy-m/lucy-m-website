import { z } from "zod";
import { getDebugInfo, type SceneObject } from "../../../model";
import { makeFishingScene } from "../fishing-scene";
import type { FishingSceneState } from "../fishing-scene-state";

const interactive = Cypress.config("isInteractive");
// const interactive = false;

describe("fishing scene", () => {
  let fisherman: SceneObject | undefined;
  let xpBar: SceneObject | undefined;

  const getXpBarInfo = () => {
    expect(xpBar).to.exist;
    const info = getDebugInfo(
      xpBar!,
      z.object({
        fillFracSpring: z.object({
          position: z.number(),
          velocity: z.number(),
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

  const renderFishingScene = (args: {
    initialState: FishingSceneState | undefined;
  }) => {
    cy.mountViewScene({
      sceneSpec: makeFishingScene(args.initialState),
      seed: "abcd",
      onSceneChange: (scene) => {
        fisherman = scene
          .getObjects()
          .find((obj) => obj.typeName === "fisherman");

        xpBar = scene.getObjects().find((obj) => obj.typeName === "xp-bar");
      },
    });
  };

  beforeEach(() => {
    if (!interactive) {
      cy.clock();
    }

    cy.viewport(1400, 900);
  });

  describe("level 0", () => {
    beforeEach(() => {
      renderFishingScene({ initialState: undefined });
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

                it.only("resets xp bar", () => {
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

  describe("level 5", () => {
    beforeEach(() => {
      renderFishingScene({
        initialState: {
          level: 5,
          levelXp: 40,
          nextLevelXp: 200,
          totalXp: 740,
        },
      });
    });

    it("initialises xp bar correcly", () => {
      cy.myWaitFor(() => getXpBarInfo().fadeInOpacity === 1, interactive);
      cy.myWaitFor(
        () => getXpBarInfo().fillFracSpring.position === 0.2,
        interactive
      );
    });

    describe("catching a fish", () => {
      beforeEach(() => {
        cy.myWaitFor(
          () => getXpBarInfo().fillFracSpring.velocity === 0,
          interactive
        ).then(() => {
          retrieveFish("some-fish");
        });
      });

      it("updates xp correctly", () => {
        cy.myWaitFor(
          () => getXpBarInfo().fillFracSpring.position === 0.25,
          interactive
        );
      });
    });
  });
});
