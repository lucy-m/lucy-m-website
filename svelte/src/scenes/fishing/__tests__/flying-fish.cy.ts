import { Subject } from "rxjs";
import type { PRNG } from "seedrandom";
import { PosFns, type SceneObject, type SceneType } from "../../../model";
import { flyingFish } from "../objects/flying-fish";

const interactive = Cypress.config("isInteractive");
// const interactive = false;

describe("flying-fish", () => {
  let debugDrawSub: Subject<(ctx: CanvasRenderingContext2D) => void>;
  let lastFish: SceneObject | undefined;

  beforeEach(() => {
    debugDrawSub = new Subject();
    lastFish = undefined;

    if (!interactive) {
      cy.clock();
    }
  });

  const getLastDebugInfo = ():
    | { rotation: number; stationary: boolean }
    | undefined => {
    const debugInfo = lastFish?._getDebugInfo && lastFish?._getDebugInfo();
    const rotation = debugInfo?.rotation;
    const stationary = debugInfo?.stationary;

    if (typeof rotation === "number" && typeof stationary === "boolean") {
      return { rotation, stationary };
    } else {
      return undefined;
    }
  };

  const renderFish = (
    args: Omit<Parameters<typeof flyingFish>[0], "random" | "fishType">
  ) => {
    cy.mountSceneObject({
      makeObjects: (random: PRNG) => [
        flyingFish({ random, fishType: "commonBrown", ...args }),
      ],
      seed: "sssss",
      onSceneChange: (scene: SceneType) => {
        lastFish = scene
          .getObjects()
          .find((obj) => obj.typeName === "flying-fish");
      },
      debugDraw$: debugDrawSub,
      debugTrace: {
        sources: (scene: SceneType) => scene.getObjects(),
        colour: () => "mediumaquamarine",
      },
    }).then(() => {
      debugDrawSub.next((ctx) => {
        ctx.strokeStyle = "darkred";
        ctx.ellipse(args.target.x, args.target.y, 30, 30, 0, 0, 2 * Math.PI);
        ctx.stroke();
      });
    });
  };

  describe("from bottom left", () => {
    beforeEach(() => {
      renderFish({
        initial: PosFns.new(1300, 900),
        target: PosFns.new(200, 600),
        onTargetReached: cy.spy().as("onTargetReached"),
        getProficiency: () => 1,
      });
    });

    it("reaches target", () => {
      cy.myWaitFor(
        () => getLastDebugInfo()?.stationary ?? false,
        interactive
      ).then(() => {
        const rotation = getLastDebugInfo()!.rotation % 360;
        expect(rotation).to.exist;
        if (rotation > 0) {
          expect(rotation).to.be.lessThan(20);
        } else {
          expect(rotation).to.be.greaterThan(-20);
        }
        cy.get("@onTargetReached").should("have.been.calledOnce");
      });
    });
  });

  describe("from bottom right", () => {
    beforeEach(() => {
      renderFish({
        initial: PosFns.new(400, 800),
        target: PosFns.new(1400, 800),
        onTargetReached: cy.spy().as("onTargetReached"),
        getProficiency: () => 1,
      });
    });

    it("reaches target", () => {
      cy.myWaitFor(
        () => getLastDebugInfo()?.stationary ?? false,
        interactive
      ).then(() => {
        const rotation = getLastDebugInfo()!.rotation % 360;
        expect(rotation).to.exist;
        expect(rotation).to.be.greaterThan(160);
        expect(rotation).to.be.lessThan(200);
        cy.get("@onTargetReached").should("have.been.calledOnce");
      });
    });
  });
});
