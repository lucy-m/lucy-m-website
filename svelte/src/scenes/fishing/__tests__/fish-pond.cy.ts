import type Sinon from "cypress/types/sinon";
import fc from "fast-check";
import { Subject } from "rxjs";
import seedrandom, { type PRNG } from "seedrandom";
import { z } from "zod";
import {
  PosFns,
  generatePointsInShape,
  getDebugInfo,
  pointInShape,
  type Position,
  type SceneObject,
  type SceneType,
} from "../../../model";
import { chooseOp } from "../../../utils";
import { makeFishPond, pondBounds } from "../objects/fish-pond";
import { fishingBg } from "../objects/fishing-bg";

describe("fish pond", () => {
  describe("example", () => {
    const interactive = Cypress.config("isInteractive");
    // const interactive = false;

    let bobberLocation: Subject<Position | undefined>;
    let removeBitingFish: Subject<void>;
    let lastScene: SceneType;
    let onFishBiteSpy: Sinon.SinonSpy;

    const getBitingFish = (): SceneObject[] => {
      const fish = lastScene
        .getObjects()
        .filter((obj) => obj.typeName === "swimming-fish");
      const bitingFish = fish.filter((fish) => {
        const debugInfo = getDebugInfo(
          fish,
          z.object({
            stateKind: z.string(),
          })
        );
        return debugInfo.stateKind === "biting";
      });
      return bitingFish;
    };

    const mount = () => {
      bobberLocation = new Subject();
      removeBitingFish = new Subject();

      const debugDraw$ = bobberLocation.pipe(
        chooseOp((pos) => {
          if (pos) {
            return (ctx: CanvasRenderingContext2D) => {
              ctx.fillStyle = "lightblue";
              ctx.ellipse(pos.x, pos.y, 20, 20, 0, 0, 2 * Math.PI);
              ctx.fill();
            };
          } else {
            return undefined;
          }
        })
      );

      onFishBiteSpy = cy
        .stub()
        .as("onFishBite")
        .callsFake(() => {
          bobberLocation.next(undefined);
        });

      return cy.mountSceneObject({
        makeObjects: (random: PRNG) => [
          fishingBg(random),
          makeFishPond({
            random,
            bobberLocation$: bobberLocation,
            onFishBite: onFishBiteSpy,
            removeBitingFish$: removeBitingFish,
          }),
        ],
        seed: "pond",
        onSceneChange: (scene: SceneType) => {
          lastScene = scene;
        },
        debugDraw$,
      });
    };

    beforeEach(() => {
      if (!interactive) {
        cy.clock();
      }
    });

    beforeEach(() => {
      mount();
    });

    it("spawns fish", () => {
      const fish = lastScene
        .getObjects()
        .filter((obj) => obj.typeName === "swimming-fish");
      expect(fish).to.have.length.greaterThan(0);
    });

    describe("bobber location passed in", () => {
      beforeEach(() => {
        bobberLocation.next(PosFns.new(900, 500));
      });

      describe("fish bites", () => {
        beforeEach(() => {
          cy.myWaitFor(() => onFishBiteSpy.callCount > 0, interactive);
        });

        it("has a biting fish", () => {
          expect(getBitingFish()).to.have.length(1);
        });

        describe("remove biting fish", () => {
          beforeEach(() => {
            removeBitingFish.next();
          });

          it("removes correct fish", () => {
            expect(getBitingFish()).to.have.length(0);
          });

          it("replaces fish", () => {
            cy.myWaitFor(
              () =>
                lastScene
                  .getObjects()
                  .filter((obj) => obj.typeName === "swimming-fish").length ===
                4,
              interactive
            );
          });
        });
      });
    });
  });

  describe("property", () => {
    const interactive = false;

    beforeEach(() => {
      if (!interactive) {
        cy.clock();
      }
    });

    describe("fish never moves outside pond bounds", () => {
      fc.assert(
        fc.property(fc.string(), (seed) => {
          it("seed " + seed, () => {
            const debugDrawSub = new Subject<
              (ctx: CanvasRenderingContext2D) => void
            >();
            const bobberLocationSub = new Subject<Position | undefined>();
            const random = seedrandom(seed);
            let fishPositions: Position[] = [];

            cy.mountSceneObject({
              makeObjects: (random: PRNG) => [
                fishingBg(random),
                makeFishPond({
                  random,
                  bobberLocation$: bobberLocationSub,
                  onFishBite: () => {},
                  removeBitingFish$: new Subject(),
                }),
              ],
              seed,
              onSceneChange: (scene: SceneType) => {
                const positions = scene
                  .getObjects()
                  .filter((obj) => obj.typeName === "swimming-fish")
                  .map((obj) => obj.getPosition());

                fishPositions = fishPositions.concat(positions);
              },
              debugDraw$: debugDrawSub,
              debugTrace: {
                sources: (scene: SceneType) =>
                  scene
                    .getObjects()
                    .filter((obj) => obj.typeName === "swimming-fish"),
                colour: ({
                  obj,
                  index,
                }: {
                  obj: SceneObject;
                  index: number;
                }) => {
                  const debugInfo = getDebugInfo(
                    obj,
                    z.object({
                      stateKind: z.string(),
                    })
                  );

                  const h = index * 40;
                  const s = 80;
                  const l = debugInfo.stateKind === "chasing" ? 70 : 40;

                  return `hsl(${h}, ${s}%, ${l}%)`;
                },
              },
            }).then(() => {
              debugDrawSub.next((ctx) => {
                ctx.beginPath();
                pondBounds.forEach((pos) => {
                  ctx.lineTo(pos.x, pos.y);
                });
                ctx.closePath();
                ctx.stroke();
              });
            });

            cy.interactiveWait(10_000, interactive).then(() => {
              const bobberLocation = generatePointsInShape(
                1,
                pondBounds,
                random
              )[0];
              bobberLocationSub.next(bobberLocation);
              debugDrawSub.next((ctx) => {
                ctx.beginPath();
                ctx.fillStyle = "white";
                ctx.ellipse(
                  bobberLocation.x,
                  bobberLocation.y,
                  15,
                  15,
                  0,
                  0,
                  2 * Math.PI
                );
                ctx.fill();
              });
            });

            cy.interactiveWait(15_000, interactive).then(() => {
              const outOfBoundPositions = fishPositions.filter(
                (p) => !pointInShape(pondBounds, p)
              );
              expect(outOfBoundPositions).to.be.empty;
            });
          });
        }),
        { numRuns: 10 }
      );
    });

    describe("onBite called once per bobber", () => {
      fc.assert(
        fc.property(fc.string(), (seed) => {
          it("seed " + seed, () => {
            const bobberLocationSub = new Subject<Position | undefined>();
            const random = seedrandom(seed);
            const biteSpy = cy
              .stub()
              .as("onBiteSpy")
              .callsFake(() => {
                bobberLocationSub.next(undefined);
              });
            cy.mountSceneObject({
              seed,
              makeObjects: (random: PRNG) => [
                fishingBg(random),
                makeFishPond({
                  random,
                  bobberLocation$: bobberLocationSub,
                  onFishBite: biteSpy,
                  removeBitingFish$: new Subject(),
                }),
              ],
            }).then(() => {
              const bobberLocation = generatePointsInShape(
                1,
                pondBounds,
                random
              )[0];
              bobberLocationSub.next(bobberLocation);
            });

            cy.myWaitFor(() => biteSpy.callCount > 0, interactive, {
              timeout: 10_000,
            });

            cy.interactiveWait(10_000, interactive)
              .then(() => {
                expect(biteSpy.callCount).to.eq(1);
              })
              .then(() => {
                const bobberLocation = generatePointsInShape(
                  1,
                  pondBounds,
                  random
                )[0];
                bobberLocationSub.next(bobberLocation);
              });

            cy.myWaitFor(() => biteSpy.callCount > 1, interactive, {
              timeout: 15_000,
            });
            cy.interactiveWait(10_000, interactive).then(() => {
              expect(biteSpy.callCount).to.eq(2);
            });
          });
        }),
        { numRuns: 10 }
      );
    });
  });
});
