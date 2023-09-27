import { Subject } from "rxjs";
import { z } from "zod";
import { getDebugInfo, type Position, type SceneObject } from "../../../model";
import { makeFishingScene } from "../fishing-scene";
import {
  initialFishingSceneState,
  type FishingSceneState,
} from "../fishing-scene-state";

const interactive = Cypress.config("isInteractive");
// const interactive = false;

describe("fishing scene", () => {
  let fisherman: SceneObject | undefined;
  let xpBar: SceneObject | undefined;
  let gameMenu: SceneObject | undefined;

  let worldClickSub: Subject<Position>;

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

  const renderFishingScene = (args: {
    initialState: FishingSceneState | undefined;
  }) => {
    worldClickSub = new Subject();

    cy.mountViewScene({
      sceneSpec: makeFishingScene({
        initialState: args.initialState,
        onStateChange: cy.spy().as("onStateChangeSpy"),
      }),
      seed: "abcd",
      onSceneChange: (scene) => {
        fisherman = scene
          .getObjects()
          .find((obj) => obj.typeName === "fisherman");

        xpBar = scene.getObjects().find((obj) => obj.typeName === "xp-bar");
        gameMenu = scene
          .getObjects()
          .find((obj) => obj.typeName === "game-menu");
      },
      worldClick$: worldClickSub,
    });
  };

  const getOnStateChangeSpy = () =>
    cy.get<sinon.SinonSpy<[FishingSceneState], void>>("@onStateChangeSpy");

  beforeEach(() => {
    if (!interactive) {
      cy.clock();
    }
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

      it("calls onStateChange", () => {
        getOnStateChangeSpy().then((spy) => {
          expect(spy.lastCall.args[0]).to.deep.equal(initialFishingSceneState);
        });
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

          it("calls onStateChange", () => {
            getOnStateChangeSpy().then((spy) => {
              expect(spy.lastCall.args[0]).to.deep.equal({
                level: 1,
                levelXp: 10,
                nextLevelXp: 30,
                totalXp: 10,
              } as FishingSceneState);
            });
          });

          describe("opening menu", () => {
            beforeEach(() => {
              expect(gameMenu).to.exist;
              worldClickSub.next(gameMenu!.getPosition());
              cy.interactiveWait(1000, interactive);
            });

            it("displays correctly", () => {
              cy.getByTestId("game-menu-overlay")
                .should("be.visible")
                .should("contain.text", "Level 1")
                .should("contain.text", "XP 10/30");
            });
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

              it("calls onStateChange", () => {
                getOnStateChangeSpy().then((spy) => {
                  expect(spy.lastCall.args[0]).to.deep.equal({
                    level: 2,
                    levelXp: 0,
                    nextLevelXp: 44,
                    totalXp: 30,
                  } as FishingSceneState);
                });
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
        retrieveFish("some-fish");
      });

      it("updates xp correctly", () => {
        cy.myWaitFor(
          () => getXpBarInfo().fillFracSpring.position === 0.25,
          interactive
        );
      });

      describe("opening menu", () => {
        beforeEach(() => {
          expect(gameMenu).to.exist;
          worldClickSub.next(gameMenu!.getPosition());
          cy.interactiveWait(1000, interactive);
        });

        it("displays correctly", () => {
          cy.getByTestId("game-menu-overlay")
            .should("be.visible")
            .should("contain.text", "Level 5")
            .should("contain.text", "XP 50/200");
        });
      });
    });
  });
});
