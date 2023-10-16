import fc from "fast-check";
import { Subject } from "rxjs";
import seedrandom, { type PRNG } from "seedrandom";
import { z } from "zod";
import {
  getDebugInfo,
  makeSceneObject,
  PosFns,
  positionSchema,
  type SceneObject,
  type SceneType,
} from "../../../model";
import { bobberBounds, makeBobber } from "../objects";
import { calcProficiency } from "../objects/calc-proficiency";

describe("bobber", () => {
  let bobber: SceneObject | undefined;

  const getBobberInfo = () => {
    if (bobber) {
      return getDebugInfo(
        bobber,
        z.object({
          target: positionSchema,
          stationary: z.boolean(),
        })
      );
    } else {
      return undefined;
    }
  };

  const mount = (overrides?: { seed?: string; proficiency?: number }) => {
    bobber = undefined;

    const debugDrawSub = new Subject<(ctx: CanvasRenderingContext2D) => void>();

    cy.mountSceneObject({
      seed: overrides?.seed ?? "bobber",
      makeObjects: (random: PRNG) => [
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

        makeBobber({
          random,
          onLand: cy.spy().as("onLandSpy"),
          getProficiency: () => overrides?.proficiency ?? 1,
        }),
      ],
      debugDraw$: debugDrawSub,
      debugTrace: {
        sources: (scene: SceneType) => scene.getObjects(),
        colour: () => "orange",
      },
      onSceneChange: (scene: SceneType) => {
        bobber = scene.getObjects().find((obj) => obj.typeName === "bobber");
      },
    }).then(() => {
      debugDrawSub.next((ctx) => {
        ctx.beginPath();
        ctx.strokeStyle = "yellow";
        ctx.rect(
          bobberBounds.min.x,
          bobberBounds.min.y,
          bobberBounds.max.x - bobberBounds.min.x,
          bobberBounds.max.y - bobberBounds.min.y
        );
        ctx.stroke();
      });

      const { target } = getDebugInfo(
        bobber!,
        z.object({
          target: positionSchema,
        })
      );

      debugDrawSub.next((ctx) => {
        ctx.beginPath();
        ctx.strokeStyle = "red";
        ctx.ellipse(target.x, target.y, 30, 30, 0, 0, 2 * Math.PI);
        ctx.ellipse(target.x, target.y, 28, 28, 0, 0, 2 * Math.PI);
        ctx.stroke();

        ctx.beginPath();
        ctx.ellipse(target.x, target.y, 4, 4, 0, 0, 2 * Math.PI);
        ctx.fill();
      });
    });
  };

  const getOnLandSpy = () => cy.get("@onLandSpy");

  const waitForBobberStationary = (interactive: boolean) =>
    cy.myWaitFor(() => {
      const debugInfo = getBobberInfo();
      return debugInfo !== undefined ? debugInfo.stationary : false;
    }, interactive);

  describe("example", () => {
    const interactive = Cypress.config("isInteractive");
    // const interactive = false;

    beforeEach(() => {
      if (!interactive) {
        cy.clock();
      }
    });

    describe("level 0", () => {
      beforeEach(() => {
        mount();
      });

      it("lands", () => {
        getOnLandSpy().should("not.have.been.called");

        waitForBobberStationary(interactive);

        getOnLandSpy().should("have.been.calledOnce");
      });
    });

    describe("level 50", () => {
      beforeEach(() => {
        mount({ proficiency: calcProficiency({ level: 50, talents: [] }) });
      });

      it("lands", () => {
        getOnLandSpy().should("not.have.been.called");

        waitForBobberStationary(interactive);

        getOnLandSpy().should("have.been.calledOnce");
      });
    });
  });

  describe("property", () => {
    describe("bobber lands near target", () => {
      fc.assert(
        fc.property(fc.string(), (seed) => {
          it("seed " + seed, () => {
            cy.clock();

            mount({ seed });
            waitForBobberStationary(false).then(() => {
              const position = bobber!.getPosition();
              const bobberInfo = getBobberInfo()!;

              expect(position.x).to.be.gte(bobberBounds.min.x);
              expect(position.x).to.be.lte(bobberBounds.max.x);
              expect(position.y).to.be.gte(bobberBounds.min.y);
              expect(position.y).to.be.lte(bobberBounds.max.y);

              const targetOffset = PosFns.sub(bobberInfo.target, position);

              expect(Math.abs(targetOffset.x)).to.be.lte(100);
              expect(Math.abs(targetOffset.y)).to.be.lte(100);
            });
          });
        }),
        { numRuns: 20 }
      );
    });

    describe("higher level lands before lower level", () => {
      const getBobberInfo = (bobber: SceneObject) => {
        return getDebugInfo(
          bobber,
          z.object({
            target: positionSchema,
            stationary: z.boolean(),
          })
        );
      };

      fc.assert(
        fc.property(fc.string(), (seed) => {
          it("seed " + seed, () => {
            const bobber1 = makeBobber({
              onLand: () => {},
              getProficiency: () => 1,
              random: seedrandom(seed),
            });

            const bobber2 = makeBobber({
              onLand: () => {},
              getProficiency: () => calcProficiency({ level: 20, talents: [] }),
              random: seedrandom(seed),
            });

            expect(getBobberInfo(bobber1).stationary).to.be.false;
            expect(getBobberInfo(bobber2).stationary).to.be.false;

            const bobber1LandCount = (() => {
              for (let i = 0; i < 200; i++) {
                bobber1.onTick!();

                if (getBobberInfo(bobber1).stationary) {
                  return i;
                }
              }
            })();
            expect(bobber1LandCount).to.exist;

            const bobber2LandCount = (() => {
              for (let i = 0; i < 200; i++) {
                bobber2.onTick!();

                if (getBobberInfo(bobber2).stationary) {
                  return i;
                }
              }
            })();

            expect(bobber2LandCount).to.exist;
            expect(bobber2LandCount).to.be.lt(bobber1LandCount!);
          });
        }),
        { numRuns: 100 }
      );
    });
  });
});
