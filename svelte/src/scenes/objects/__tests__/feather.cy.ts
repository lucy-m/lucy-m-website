import { Subject } from "rxjs";
import { PosFns, type SceneObject, type SceneType } from "../../../model";
import { choose, maxBy, minBy } from "../../../utils";
import { makeFeather } from "../feather";
import ObjectFixture from "./ObjectFixture.svelte";

const getFeatherRotation = (
  feather: SceneObject<string, unknown>
): number | undefined => {
  const firstLayer = feather.getLayers(feather)[0];

  if (
    firstLayer &&
    firstLayer.kind === "image" &&
    firstLayer.rotation !== undefined
  ) {
    return firstLayer.rotation;
  }
};

const getFeatherPositionLimit = (
  scenes: SceneType<string>[],
  type: "min" | "max"
): readonly [number, SceneObject<string, unknown>] => {
  return (type === "max" ? maxBy : minBy)(
    choose(scenes, (scene) => {
      const firstObject = scene.objects[0];
      if (firstObject) {
        return [firstObject.position.x, firstObject] as const;
      }
      return undefined;
    }),
    ([x]) => x
  );
};

const getFeatherRotationLimit = (
  scenes: SceneType<string>[],
  type: "min" | "max"
): readonly [number, SceneObject<string, unknown>] => {
  return (type === "max" ? maxBy : minBy)(
    choose(scenes, (scene) => {
      const firstObject = scene.objects[0];
      if (firstObject) {
        const rotation = getFeatherRotation(firstObject);
        if (rotation) {
          return [rotation, firstObject] as const;
        }
      }
      return undefined;
    }),
    ([rotation]) => rotation
  );
};

describe("feather", () => {
  beforeEach(() => {
    cy.viewport(1200, 800);
  });

  it.only("works", () => {
    const debugDrawSub: Subject<(ctx: CanvasRenderingContext2D) => void> =
      new Subject();

    cy.mount(ObjectFixture, {
      props: {
        makeObject: (seed) =>
          makeFeather("feather", PosFns.new(500, 50), PosFns.new(1, 0), seed),
        seed: "abcd",
        onSceneChange: (scene) => {
          const feather = scene.objects[0];

          if (feather) {
            debugDrawSub.next((ctx) => {
              const rotation = getFeatherRotation(feather);
              ctx.fillStyle =
                rotation !== undefined ? `hsl(${rotation}, 50%, 60%)` : "black";
              ctx.fillRect(
                feather.getPosition().x,
                feather.getPosition().y,
                6,
                6
              );
            });
          }
        },
        debugDraw$: debugDrawSub,
      },
    });
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
      cy.steppedTick(25_000).then(() => {
        scenes.forEach((scene) => {
          const feather = scene.objects[0];
          debugDrawSub.next((ctx) => {
            const rotation = getFeatherRotation(feather);
            ctx.fillStyle =
              rotation !== undefined ? `hsl(${rotation}, 50%, 60%)` : "black";
            ctx.fillRect(feather.position.x, feather.position.y, 6, 6);
          });
        });
      });
    });

    it("snapshot", () => {
      cy.percySnapshot();
    });

    it("min rotation is reached at max x", () => {
      const [maxX, maxXObject] = getFeatherPositionLimit(scenes, "max");
      const [minRotation, minRotationObject] = getFeatherRotationLimit(
        scenes,
        "min"
      );

      debugDrawSub.next((ctx) => {
        ctx.fillStyle = "darkred";
        ctx.fillRect(maxXObject.position.x, maxXObject.position.y, 10, 30);
        ctx.fillText(
          `max X (${maxXObject.position.x.toFixed(
            2
          )}, ${maxXObject.position.y.toFixed(2)})`,
          maxXObject.position.x,
          maxXObject.position.y + 50
        );

        ctx.fillStyle = "navy";
        ctx.fillRect(
          minRotationObject.position.x,
          minRotationObject.position.y,
          30,
          10
        );
        ctx.fillText(
          `min rotation ${minRotation.toFixed(2)}deg `,
          minRotationObject.position.x + 40,
          minRotationObject.position.y + 14
        );
      });

      expect(maxX - 1).to.be.lessThan(minRotationObject.position.x);
      expect(maxX + 1).to.be.greaterThan(minRotationObject.position.x);
    });

    it("max rotation is reached at min x", () => {
      const [minX, minXObject] = getFeatherPositionLimit(scenes, "min");
      const [maxRotation, maxRotationObject] = getFeatherRotationLimit(
        scenes,
        "max"
      );

      debugDrawSub.next((ctx) => {
        ctx.fillStyle = "darkred";
        ctx.fillRect(minXObject.position.x, minXObject.position.y, 10, 30);
        ctx.fillText(
          `max X (${minXObject.position.x.toFixed(
            2
          )}, ${minXObject.position.y.toFixed(2)})`,
          minXObject.position.x,
          minXObject.position.y + 50
        );

        ctx.fillStyle = "navy";
        ctx.fillRect(
          maxRotationObject.position.x,
          maxRotationObject.position.y,
          30,
          10
        );
        ctx.fillText(
          `min rotation ${maxRotation.toFixed(2)}deg `,
          maxRotationObject.position.x + 40,
          maxRotationObject.position.y + 14
        );
      });

      expect(minX - 1).to.be.lessThan(maxRotationObject.position.x);
      expect(minX + 1).to.be.greaterThan(maxRotationObject.position.x);
    });
  });
});
