import fc from "fast-check";
import { Subject } from "rxjs";
import seedrandom from "seedrandom";
import { z } from "zod";
import {
  getDebugInfo,
  type Position,
  type SceneObject,
  type SceneType,
} from "../../../model";
import { levelToProficiency } from "../objects/level-to-proficiency";
import { reelingOverlay } from "../objects/reeling-overlay";

const interactive = Cypress.config("isInteractive");
// const interactive = false;

describe("reeling-overlay", () => {
  describe("rendering tests", () => {
    let lastScene: SceneType;
    let worldClickSub: Subject<Position>;

    const getSpinner = (): SceneObject => {
      const value = lastScene
        .getObjects()
        .find((obj) => obj.typeName === "reeling-overlay");

      expect(value).to.exist;
      return value!;
    };

    const clickSpinner = () => {
      worldClickSub.next(getSpinner().getPosition());
    };

    const getSpinnerRotation = (): {
      rotation: number;
      rotationSpeed: number;
    } => {
      const reel = getSpinner();
      expect(reel?._getDebugInfo).to.exist;
      const debugInfo = reel!._getDebugInfo!();
      const rotation = debugInfo?.rotation;
      const rotationSpeed = debugInfo?.rotationSpeed;

      return { rotation, rotationSpeed };
    };

    beforeEach(() => {
      cy.viewport(1400, 900);

      if (!interactive) {
        cy.clock();
      }

      worldClickSub = new Subject();

      cy.mountSceneObject({
        makeObjects: (random) => [
          reelingOverlay({
            random,
            onComplete: cy.spy().as("onCompleteSpy"),
            getProficiency: () => 1,
          }),
        ],
        seed: "any",
        onSceneChange: (scene) => {
          lastScene = scene;
        },
        worldClick$: worldClickSub,
      });
    });

    it("flies in from top", () => {
      const initialPosition = getSpinner().getPosition();

      cy.interactiveWait(1_000, interactive).then(() => {
        const newPosition = getSpinner().getPosition();
        expect(newPosition.x).to.eq(initialPosition.x);
        expect(newPosition.x).to.be.greaterThan(initialPosition.y);
      });
    });

    it("spinner is spinning", () => {
      const initialRotation = getSpinnerRotation();

      cy.interactiveWait(1_000, interactive).then(() => {
        const newRotation = getSpinnerRotation();
        expect(newRotation.rotation).to.be.greaterThan(
          initialRotation.rotation
        );
      });
    });

    it("clicking the reeling overlay increases speed", () => {
      const initialRotation = getSpinnerRotation();

      clickSpinner();
      cy.interactiveWait(100, interactive).then(() => {
        const newRotation = getSpinnerRotation();
        expect(newRotation.rotationSpeed).to.be.greaterThan(
          initialRotation.rotationSpeed
        );
      });
    });

    it("reel decelerates to min speed", () => {
      Array.from({ length: 5 }).forEach(() => {
        clickSpinner();
      });

      cy.interactiveWait(100, interactive).then(() => {
        const firstRotation = getSpinnerRotation();

        cy.interactiveWait(1_000, interactive).then(() => {
          const secondRotation = getSpinnerRotation();

          expect(secondRotation.rotationSpeed).to.be.lessThan(
            firstRotation.rotationSpeed
          );
        });
      });

      cy.interactiveWait(3_000, interactive).then(() => {
        const laterRotation = getSpinnerRotation();
        expect(laterRotation.rotationSpeed).to.eq(0.3);
      });
    });

    describe("completing the reel", () => {
      beforeEach(() => {
        cy.get("@onCompleteSpy").should("not.have.been.called");

        Array.from({ length: 32 }).forEach(() => {
          cy.interactiveWait(100, interactive).then(() => {
            clickSpinner();
          });
        });

        cy.interactiveWait(100, interactive).then(() => {
          const rotation = getSpinnerRotation();
          expect(rotation.rotation).to.be.greaterThan(360 * 4);
        });
      });

      it("calls onComplete", () => {
        cy.get("@onCompleteSpy").should("have.been.calledOnce");
      });

      it("disappears", () => {
        cy.interactiveWait(1_000, interactive).then(() => {
          expect(lastScene.getObjects()).to.have.length(0);
        });
      });
    });
  });

  describe("property", () => {
    describe("higher level", () => {
      describe("reel completes in less time", () => {
        fc.assert(
          fc.property(fc.string(), (seed) => {
            const reelCountForLevel = (level: number): number => {
              const complete = Cypress.sinon.spy();

              const reel = reelingOverlay({
                random: seedrandom(seed),
                getProficiency: () => levelToProficiency(level),
                onComplete: complete,
              });

              const reelCompleteCount = (() => {
                for (let i = 0; i < 100; i++) {
                  reel.onTick!();
                  reel.onInteract!();

                  if (complete.getCalls().length > 0) {
                    return i;
                  }
                }
              })();
              expect(reelCompleteCount).to.exist;

              return reelCompleteCount!;
            };

            it("seed " + seed, () => {
              const level0 = reelCountForLevel(0);
              const level3 = reelCountForLevel(3);
              const level10 = reelCountForLevel(10);

              expect(level0).to.be.gt(level3);
              expect(level3).to.be.gt(level10);
            });
          }),
          { numRuns: 20 }
        );
      });

      describe("reel interact is more powerful", () => {
        fc.assert(
          fc.property(fc.string(), (seed) => {
            const getInteractSpeedChange = (level: number): number => {
              const reel = reelingOverlay({
                random: seedrandom(seed),
                onComplete: () => {},
                getProficiency: () => levelToProficiency(level),
              });

              const before = getDebugInfo(
                reel,
                z.object({
                  rotationSpeed: z.number(),
                })
              ).rotationSpeed;

              reel.onInteract!();

              const after = getDebugInfo(
                reel,
                z.object({
                  rotationSpeed: z.number(),
                })
              ).rotationSpeed;

              return after - before;
            };

            it("seed " + seed, () => {
              const level0 = getInteractSpeedChange(0);
              const level3 = getInteractSpeedChange(3);
              const level10 = getInteractSpeedChange(10);

              expect(level0).to.be.lt(level3);
              expect(level3).to.be.lt(level10);
            });
          }),
          { numRuns: 1 }
        );
      });
    });
  });
});
