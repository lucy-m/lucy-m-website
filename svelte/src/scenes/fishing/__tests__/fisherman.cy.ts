import { Subject } from "rxjs";
import seedrandom from "seedrandom";
import { z } from "zod";
import {
  PosFns,
  getDebugInfo,
  makeSceneObject,
  type Position,
  type SceneObject,
  type SceneType,
} from "../../../model";
import type { AnyFishingState } from "../objects";
import { bobberBounds, fishingMan } from "../objects";

describe("fisherman", () => {
  describe("example", () => {
    const interactive = Cypress.config("isInteractive");
    // const interactive = false;

    let debugDrawSub: Subject<(ctx: CanvasRenderingContext2D) => void>;
    let worldClickSub: Subject<Position>;
    let lastScene: SceneType;

    const findByTypeName = (typeName: string): SceneObject | undefined => {
      return lastScene.getObjects().find((obj) => obj.typeName === typeName);
    };

    const getFisherman = () => findByTypeName("fisherman");
    const getBobber = () => findByTypeName("bobber");
    const getBiteMarker = () => findByTypeName("bite-marker");
    const getReelingOverlay = () => findByTypeName("reeling-overlay");
    const getFlyingFish = () => findByTypeName("flying-fish");

    const assertCorrectObjects = (
      objs: Record<
        "fisherman" | "bobber" | "biteMarker" | "reelingOverlay" | "flyingFish",
        boolean
      >
    ) => {
      const assertExists = (obj: SceneObject | undefined, exists: boolean) => {
        if (exists) {
          expect(obj).to.exist;
        } else {
          expect(obj).to.be.undefined;
        }
      };
      assertExists(getFisherman(), objs.fisherman);
      assertExists(getBobber(), objs.bobber);
      assertExists(getBiteMarker(), objs.biteMarker);
      assertExists(getReelingOverlay(), objs.reelingOverlay);
      assertExists(getFlyingFish(), objs.flyingFish);
    };

    const getFishermanState = () => {
      const debugInfo = getDebugInfo(
        getFisherman()!,
        z.object({
          state: z.any(),
        })
      );
      return debugInfo.state as AnyFishingState;
    };

    const mount = (overrides?: { getCurrentLevel?: () => number }) => {
      cy.mountSceneObject({
        makeObjects: (random) => [
          makeSceneObject(random)({
            layerKey: "background",
            getPosition: () => PosFns.zero,
            getLayers: () => [
              {
                kind: "image",
                assetKey: "fishingBackground",
              },
            ],
          }),
          fishingMan({
            random,
            onFishRetrieved: cy.spy().as("onFishRetrieved"),
            getCurrentLevel: overrides?.getCurrentLevel ?? (() => 0),
          }),
        ],
        debugDraw$: debugDrawSub,
        worldClick$: worldClickSub,
        layerOrder: [
          "background",
          "man",
          "pond",
          "bobber",
          "bite-marker",
          "fish",
          "reeling",
        ],
        seed: "some-seed-12341",
        onSceneChange: (scene) => {
          lastScene = scene;
        },
        debugTrace: {
          sources: (scene) =>
            scene
              .getObjects()
              .filter(
                (obj) =>
                  obj.typeName === "bobber" || obj.typeName === "flying-fish"
              ),
          colour: ({ obj }) => {
            if (obj.typeName === "bobber") {
              return "mediumaquamarine";
            } else if (obj.typeName === "flying-fish") {
              return "orange";
            }
          },
        },
      });
    };

    beforeEach(() => {
      if (!interactive) {
        cy.clock();
      }

      debugDrawSub = new Subject();
      worldClickSub = new Subject();
    });

    describe("level 0", () => {
      beforeEach(() => {
        mount();
      });

      it("scene has correct objects", () => {
        assertCorrectObjects({
          fisherman: true,
          bobber: false,
          biteMarker: false,
          reelingOverlay: false,
          flyingFish: false,
        });
      });

      describe("clicking man", () => {
        beforeEach(() => {
          const position = getFisherman()?.getPosition();
          expect(position).to.exist;
          worldClickSub.next(position!);
        });

        it("starts cast out", () => {
          const state = getFishermanState();
          expect(state.kind).to.eq("cast-out-swing");
          if (state.kind === "cast-out-swing") {
            expect(state.timer).to.eq(50);
          }
        });

        describe("after bobber lands", () => {
          beforeEach(() => {
            cy.myWaitFor(
              () => {
                const bobber = getBobber();
                if (bobber) {
                  const debugInfo = getDebugInfo(
                    bobber!,
                    z.object({
                      stationary: z.boolean(),
                    })
                  );
                  return debugInfo.stationary === true;
                } else {
                  return false;
                }
              },
              interactive,
              { timeout: 5000 }
            );
          });

          it("has correct objects", () => {
            assertCorrectObjects({
              fisherman: true,
              bobber: true,
              biteMarker: false,
              reelingOverlay: false,
              flyingFish: false,
            });
          });

          it("bobber lands in bounds", () => {
            const bobberState = (() => {
              const bobber = getBobber();
              if (bobber && bobber._getDebugInfo) {
                const position = bobber.getPosition();
                const debugInfo = bobber._getDebugInfo();
                const stationary = debugInfo?.stationary;

                if (typeof stationary === "boolean") {
                  return { position, stationary };
                }
              }
            })();

            expect(bobberState).to.exist;

            const { position, stationary } = bobberState!;

            expect(stationary).to.be.true;

            const x = position.x;
            const y = position.y;

            expect(x).to.be.lessThan(bobberBounds.max.x);
            expect(x).to.be.greaterThan(bobberBounds.min.x);
            expect(y).to.be.lessThan(bobberBounds.max.y);
            expect(y).to.be.greaterThan(bobberBounds.min.y);
          });

          describe("after bite", () => {
            beforeEach(() => {
              cy.myWaitFor(() => getBiteMarker() !== undefined, interactive, {
                timeout: 5000,
              });
            });

            it("has correct objects", () => {
              assertCorrectObjects({
                fisherman: true,
                bobber: true,
                biteMarker: true,
                reelingOverlay: false,
                flyingFish: false,
              });
            });

            describe("clicking bite marker", () => {
              beforeEach(() => {
                expect(getBiteMarker()).to.exist;
                worldClickSub.next(getBiteMarker()!.getPosition());
                cy.interactiveWait(100, interactive);
              });

              it("has correct objects", () => {
                assertCorrectObjects({
                  fisherman: true,
                  bobber: true,
                  biteMarker: false,
                  reelingOverlay: true,
                  flyingFish: false,
                });
              });

              describe("completing reeling", () => {
                beforeEach(() => {
                  Array.from({ length: 30 }).forEach(() => {
                    cy.interactiveWait(100, interactive, { log: false }).then(
                      () => {
                        const reelingOverlay = getReelingOverlay();
                        if (reelingOverlay) {
                          worldClickSub.next(
                            getReelingOverlay()!.getPosition()
                          );
                        }
                      }
                    );
                  });

                  cy.myWaitFor(() => {
                    return getReelingOverlay() === undefined;
                  }, interactive);
                });

                it("has correct objects", () => {
                  assertCorrectObjects({
                    fisherman: true,
                    bobber: false,
                    biteMarker: false,
                    reelingOverlay: false,
                    flyingFish: true,
                  });
                });

                describe("fish is retrieved", () => {
                  beforeEach(() => {
                    cy.get("@onFishRetrieved").should("not.have.been.called");
                    cy.myWaitFor(
                      () => getFlyingFish() === undefined,
                      interactive
                    );
                  });

                  it("calls callback", () => {
                    cy.get("@onFishRetrieved").should("have.been.calledOnce");
                  });
                });
              });
            });
          });
        });
      });
    });

    describe("level 50", () => {
      beforeEach(() => {
        mount({
          getCurrentLevel: () => 50,
        });
      });

      it("scene has correct objects", () => {
        assertCorrectObjects({
          fisherman: true,
          bobber: false,
          biteMarker: false,
          reelingOverlay: false,
          flyingFish: false,
        });
      });

      describe("clicking man", () => {
        beforeEach(() => {
          const position = getFisherman()?.getPosition();
          expect(position).to.exist;
          worldClickSub.next(position!);
        });

        it("starts cast out", () => {
          const state = getFishermanState();
          expect(state.kind).to.eq("cast-out-swing");
          if (state.kind === "cast-out-swing") {
            expect(state.timer).to.eq(18);
          }
        });

        describe("after bobber lands", () => {
          beforeEach(() => {
            cy.myWaitFor(() => {
              const bobber = getBobber();
              if (bobber) {
                const debugInfo = getDebugInfo(
                  bobber!,
                  z.object({
                    stationary: z.boolean(),
                  })
                );
                return debugInfo.stationary === true;
              } else {
                return false;
              }
            }, interactive);
          });

          it("has correct objects", () => {
            assertCorrectObjects({
              fisherman: true,
              bobber: true,
              biteMarker: false,
              reelingOverlay: false,
              flyingFish: false,
            });
          });
        });
      });
    });
  });

  describe("levels", () => {
    it("works", () => {
      const random = seedrandom("abcd");
      const fisherman = fishingMan({
        random,
        onFishRetrieved: cy.spy().as("fishRetrieved"),
        getCurrentLevel: () => 10,
      });

      const getFishingState = () =>
        getDebugInfo(
          fisherman,
          z.object({
            state: z.object({
              kind: z.string(),
            }),
          })
        );

      expect(getFishingState().state.kind).to.eq("idle");

      fisherman.onInteract!();

      expect(getFishingState().state.kind).to.eq("cast-out-swing");
    });
  });
});
