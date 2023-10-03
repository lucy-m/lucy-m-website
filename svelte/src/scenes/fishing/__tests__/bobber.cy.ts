import fc from "fast-check";
import { Subject } from "rxjs";
import { z } from "zod";
import {
  getDebugInfo,
  makeSceneObject,
  PosFns,
  positionSchema,
  type SceneObject,
} from "../../../model";
import { bobberBounds, makeBobber } from "../objects";

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

  const mount = (overrides?: { seed?: string }) => {
    bobber = undefined;

    const debugDrawSub = new Subject<(ctx: CanvasRenderingContext2D) => void>();

    cy.mountSceneObject({
      seed: overrides?.seed ?? "bobber",
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

        makeBobber({
          random,
          onLand: cy.spy().as("onLandSpy"),
        }),
      ],
      debugDraw$: debugDrawSub,
      debugTrace: {
        sources: (scene) => scene.getObjects(),
        colour: () => "orange",
      },
      onSceneChange: (scene) => {
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
      if (bobber) {
        const debugInfo = getDebugInfo(
          bobber,
          z.object({
            stationary: z.boolean(),
          })
        );

        return debugInfo.stationary;
      } else {
        return false;
      }
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

              expect(Math.abs(targetOffset.x)).to.be.lte(40);
              expect(Math.abs(targetOffset.y)).to.be.lte(40);
            });
          });
        }),
        { numRuns: 20 }
      );
    });
  });
});
