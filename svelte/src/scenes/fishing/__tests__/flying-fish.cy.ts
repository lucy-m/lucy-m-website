import { Subject } from "rxjs";
import { PosFns } from "../../../model";
import { flyingFish } from "../objects/flying-fish";

const interactive = Cypress.config("isInteractive");
// const interactive = false;

describe("flying-fish", () => {
  let debugDrawSub: Subject<(ctx: CanvasRenderingContext2D) => void>;
  let closest: number | undefined;
  const target = PosFns.new(200, 600);

  beforeEach(() => {
    if (!interactive) {
      cy.clock();
    }
  });

  beforeEach(() => {
    debugDrawSub = new Subject();

    cy.mountSceneObject({
      makeObjects: (random) => [
        flyingFish({ random, initial: PosFns.new(1300, 900), target }),
      ],
      seed: "sssss",
      onSceneChange: (scene) => {
        const nextPosition = scene
          .getObjects()
          .find((obj) => obj.typeName === "flying-fish")
          ?.getPosition();

        if (nextPosition) {
          const distance = PosFns.distance(target, nextPosition);
          closest =
            closest === undefined ? distance : Math.min(closest, distance);
        }
      },
      debugDraw$: debugDrawSub,
      debugTrace: {
        sources: (scene) => scene.getObjects(),
        colour: () => "mediumaquamarine",
      },
    }).then(() => {
      debugDrawSub.next((ctx) => {
        ctx.strokeStyle = "darkred";
        ctx.ellipse(target.x, target.y, 30, 30, 0, 0, 2 * Math.PI);
        ctx.stroke();
      });
    });
  });

  it("gets close to target", () => {
    cy.myWaitFor(() => closest !== undefined && closest < 20, interactive);
  });
});
