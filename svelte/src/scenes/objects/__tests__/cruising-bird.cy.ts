import { Subject } from "rxjs";
import type { PRNG } from "seedrandom";
import {
  PosFns,
  type Position,
  type SceneObject,
  type SceneType,
} from "../../../model";
import { makeCruisingBird } from "../cruising-bird";

const interactive = Cypress.config("isInteractive");

describe("cruising bird", () => {
  beforeEach(() => {
    cy.viewport(1200, 800);
    if (!interactive) {
      cy.clock();
    }
  });

  it("works", () => {
    cy.mountSceneObject({
      makeObjects: (seed: PRNG) => [
        makeCruisingBird("bird", 10, [100, 400], seed),
        makeCruisingBird("bird", 10, [400, 700], seed),
        makeCruisingBird("bird", 10, [700, 1000], seed),
      ],
      seed: "abcde",
      debugTrace: {
        sources: (scene: SceneType) => scene.getObjects(),
        colour: ({ obj, index }: { obj: SceneObject; index: number }) => {
          const flapUp = obj._getDebugInfo && obj._getDebugInfo()?.flapUp;

          const hue = (() => {
            switch (index) {
              case 0:
                return 340;
              case 1:
                return 180;
              case 2:
                return 40;
              default:
                return 0;
            }
          })();

          const lightness = (() => {
            if (flapUp === true) {
              return "40%";
            } else if (flapUp === false) {
              return "70%";
            } else {
              return "0%";
            }
          })();

          return `hsl(${hue}, 80%, ${lightness})`;
        },
      },
    });

    if (!interactive) {
      cy.steppedTick(30_000);
      cy.percySnapshot();
    }
  });

  it("responds to taps", () => {
    const worldClickSub = new Subject<Position>();
    const debugDrawSub = new Subject<(ctx: CanvasRenderingContext2D) => void>();
    let birdPosition: Position | undefined;

    const clickBird = () => {
      if (!birdPosition) {
        throw new Error("There's no bird to click");
      }

      const bp = birdPosition;

      worldClickSub.next(PosFns.add(birdPosition, PosFns.new(10, 10)));
      debugDrawSub.next((ctx) => {
        ctx.fillStyle = "darkred";
        ctx.beginPath();
        ctx.ellipse(bp.x, bp.y, 10, 10, 0, 0, 2 * Math.PI);
        ctx.fill();
      });
    };

    if (!interactive) {
      cy.clock();
    }

    cy.mountSceneObject({
      makeObjects: (seed: PRNG) => [
        makeCruisingBird("bird", 10, [100, 1000], seed),
      ],
      onSceneChange: (scene: SceneType) => {
        birdPosition = scene.getObjects()[0]?.getPosition();
      },
      seed: "wwwwow",
      debugTrace: {
        sources: (scene: SceneType) => scene.getObjects(),
        colour: ({ obj }: { obj: SceneObject }) => {
          const flapUp = obj._getDebugInfo && obj._getDebugInfo()?.flapUp;

          const lightness = (() => {
            if (flapUp === true) {
              return "40%";
            } else if (flapUp === false) {
              return "70%";
            } else {
              return "0%";
            }
          })();

          return `hsl(40, 80%, ${lightness})`;
        },
      },
      worldClick$: worldClickSub,
      debugDraw$: debugDrawSub,
    });

    const wait = (n: number) => cy.interactiveWait(n, interactive);

    wait(2_000).then(clickBird);

    wait(2_000).then(clickBird);

    wait(2_000).then(clickBird);
    wait(200).then(clickBird);

    wait(10_000).then(clickBird);
    wait(100).then(clickBird);
    wait(100).then(clickBird);

    wait(15_000);

    if (!interactive) {
      cy.percySnapshot();
    }
  });
});
