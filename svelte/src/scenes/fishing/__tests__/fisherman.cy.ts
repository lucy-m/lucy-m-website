import fc from "fast-check";
import { Subject } from "rxjs";
import {
  PosFns,
  makeSceneObject,
  type Position,
  type SceneObject,
  type SceneType,
} from "../../../model";
import type { AnyFishingState } from "../fishing-state";
import { bobberBounds } from "../objects/bobber";
import { fishingMan } from "../objects/fisherman";

describe("fisherman", () => {
  describe("manual", () => {
    // const interactive = Cypress.config("isInteractive");
    const interactive = false;

    let debugDrawSub: Subject<(ctx: CanvasRenderingContext2D) => void>;
    let worldClickSub: Subject<Position>;
    let lastScene: SceneType;

    const findByTypeName = (typeName: string): SceneObject | undefined => {
      return lastScene.getObjects().find((obj) => obj.typeName === typeName);
    };

    const getFisherman = () => findByTypeName("fisherman");
    const getBobber = () => findByTypeName("bobber");
    const getBiteMarker = () => findByTypeName("bite-marker");

    const getFishermanState = () => {
      const fisherman = getFisherman();

      expect(fisherman?._getDebugInfo).to.exist;
      const debugInfo = fisherman!._getDebugInfo!();

      expect(debugInfo?.state).to.exist;
      return debugInfo.state as AnyFishingState;
    };

    beforeEach(() => {
      cy.viewport(1400, 1000);

      if (!interactive) {
        cy.clock();
      }

      debugDrawSub = new Subject();
      worldClickSub = new Subject();

      cy.mountSceneObject({
        makeObjects: (random) => [
          makeSceneObject(random)({
            layerKey: "background",
            getPosition: () => PosFns.zero,
            getLayers: () => [
              {
                kind: "image",
                assetKey: "fishingBackground",
                subLayer: "background",
              },
            ],
          }),
          fishingMan({ random }),
        ],
        debugDraw$: debugDrawSub,
        worldClick$: worldClickSub,
        layerOrder: ["background", "man", "bobber", "bite-marker"],
        seed: "some-seed-12341",
        onSceneChange: (scene) => {
          lastScene = scene;
        },
        debugTrace: {
          sources: (scene) =>
            scene.getObjects().filter((obj) => obj.typeName === "bobber"),
          colour: () => "mediumaquamarine",
        },
      }).then(() => {
        debugDrawSub.next((ctx) => {
          ctx.strokeStyle = "yellow";
          ctx.rect(
            bobberBounds.min.x,
            bobberBounds.min.y,
            bobberBounds.max.x - bobberBounds.min.x,
            bobberBounds.max.y - bobberBounds.min.y
          );
          ctx.stroke();
        });
      });
    });

    it("scene has correct objects", () => {
      expect(getFisherman()).to.exist;
      expect(getBobber()).to.be.undefined;
      expect(getBiteMarker()).to.be.undefined;
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
      });

      describe("after bobber lands", () => {
        beforeEach(() => {
          cy.interactiveWait(3_000, interactive);
        });

        it("has correct objects", () => {
          expect(getFisherman()).to.exist;
          expect(getBobber()).to.exist;
          expect(getBiteMarker()).to.be.undefined;
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
            cy.interactiveWait(2_000, interactive);
          });

          it("has correct objects", () => {
            expect(getFisherman()).to.exist;
            expect(getBobber()).to.exist;
            expect(getBiteMarker()).to.exist;
          });
        });
      });
    });
  });

  describe("property-based", () => {
    beforeEach(() => {
      cy.viewport(1400, 1000);
      cy.clock();
    });

    describe("cast out bobber lands in bound", () => {
      fc.assert(
        fc.property(fc.string(), (seed) => {
          it("seed " + seed, () => {
            let bobberState:
              | {
                  position: Position;
                  stationary: boolean;
                }
              | undefined;

            cy.mountSceneObject({
              makeObjects: (random) => [
                makeSceneObject(random)({
                  layerKey: "background",
                  getPosition: () => PosFns.zero,
                  getLayers: () => [
                    {
                      kind: "image",
                      assetKey: "fishingBackground",
                      subLayer: "background",
                    },
                  ],
                }),
                fishingMan({
                  random,
                  initialState: { kind: "cast-out-swing" },
                }),
              ],
              layerOrder: ["background", "man", "bobber"],
              seed: "some-seed-12341",
              onSceneChange: (scene) => {
                bobberState = undefined;

                const bobber = scene
                  .getObjects()
                  .find((obj) => obj.typeName === "bobber");
                if (bobber && bobber._getDebugInfo) {
                  const position = bobber.getPosition();
                  const debugInfo = bobber._getDebugInfo();
                  const stationary = debugInfo?.stationary;

                  if (typeof stationary === "boolean") {
                    bobberState = { position, stationary };
                  }
                }
              },
              debugTrace: {
                sources: (scene) =>
                  scene.getObjects().filter((obj) => obj.typeName === "bobber"),
                colour: () => "mediumaquamarine",
              },
            });

            cy.steppedTick(5_000).then(() => {
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
          });
        }),
        { numRuns: 20 }
      );
    });
  });
});
