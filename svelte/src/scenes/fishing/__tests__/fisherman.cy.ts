import fc from "fast-check";
import { Subject } from "rxjs";
import { PosFns, makeSceneObject, type Position } from "../../../model";
import { bobberBounds } from "../objects/bobber";
import { fishingMan } from "../objects/fisherman";

describe("fisherman", () => {
  describe("manual", () => {
    const interactive = Cypress.config("isInteractive");
    // const interactive = false;

    let bobberState:
      | {
          position: Position;
          stationary: boolean;
        }
      | undefined;

    let debugDrawSub: Subject<(ctx: CanvasRenderingContext2D) => void>;

    beforeEach(() => {
      cy.viewport(1400, 1000);

      if (!interactive) {
        cy.clock();
      }

      debugDrawSub = new Subject();

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
          fishingMan(random),
        ],
        debugDraw$: debugDrawSub,
        layerOrder: ["background", "man", "bobber", "bite-marker"],
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

    it.only("works", () => {});

    it("bobber lands in bounds", () => {
      cy.interactiveWait(5_000, interactive).then(() => {
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
  });

  describe("property-based", () => {
    beforeEach(() => {
      cy.viewport(1400, 1000);
      cy.clock();
    });

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
              fishingMan(random),
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
