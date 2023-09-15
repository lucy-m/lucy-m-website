import { Subject } from "rxjs";
import { PosFns, type SceneType } from "../../../model";
import { choose, maxBy, minBy } from "../../../utils";
import { makeFeather } from "../feather";
import ObjectFixture from "./ObjectFixture.svelte";

describe("feather", () => {
  beforeEach(() => {
    cy.viewport(1200, 800);
  });

  describe("falling feather", () => {
    let scenes: SceneType<string>[];
    let debugDrawSub: Subject<(ctx: CanvasRenderingContext2D) => void>;

    beforeEach(() => {
      scenes = [];
      debugDrawSub = new Subject();

      cy.clock();

      cy.mount(ObjectFixture, {
        props: {
          makeObject: (seed) =>
            makeFeather("feather", PosFns.new(500, 50), PosFns.new(1, 0), seed),
          seed: "abcd",
          onSceneChange: (scene) => {
            scenes.push(scene);
          },
          debugDraw$: debugDrawSub,
        },
      });

      cy.get("canvas").should("have.attr", "data-initialised", "true");
      cy.steppedTick(25_000);
    });

    it("min rotation is reached at max x", () => {
      scenes.forEach((scene) => {
        const feather = scene.objects[0];
        debugDrawSub.next((ctx) => {
          ctx.fillStyle = "mediumaquamarine";
          ctx.fillRect(feather.position.x, feather.position.y, 6, 6);
        });
      });

      const [maxX, maxXObject] = maxBy(
        choose(scenes, (scene) => {
          const firstObject = scene.objects[0];
          if (firstObject) {
            return [firstObject.position.x, firstObject] as const;
          }
          return undefined;
        }),
        ([x]) => x
      );

      const [minRotation, minRotationObject] = minBy(
        choose(scenes, (scene) => {
          const firstObject = scene.objects[0];
          if (firstObject) {
            const firstLayer = firstObject.getLayers(firstObject)[0];

            if (
              firstLayer &&
              firstLayer.kind === "image" &&
              firstLayer.rotation !== undefined
            ) {
              return [firstLayer.rotation, firstObject] as const;
            }
          }
          return undefined;
        }),
        ([rotation]) => rotation
      );

      debugDrawSub.next((ctx) => {
        ctx.fillStyle = "darkred";
        ctx.fillRect(maxXObject.position.x, maxXObject.position.y, 20, 20);
        ctx.fillText(
          `max X (${maxXObject.position.x.toFixed(
            2
          )}, ${maxXObject.position.y.toFixed(2)})`,
          maxXObject.position.x + 30,
          maxXObject.position.y + 16
        );
      });

      expect(maxX - 1).to.be.lessThan(minRotationObject.position.x);
      expect(maxX + 1).to.be.greaterThan(minRotationObject.position.x);

      cy.percySnapshot();
    });
  });
});
