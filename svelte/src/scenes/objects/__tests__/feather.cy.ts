import { Subject } from "rxjs";
import {
  PosFns,
  type Position,
  type SceneObject,
  type SceneType,
} from "../../../model";
import { maxBy, minBy } from "../../../utils";
import { makeFeather } from "../feather";

const interactive = Cypress.config("isInteractive");

const getFeatherRotation = (feather: SceneObject): number | undefined => {
  const firstLayer = feather.getLayers()[0];

  if (
    firstLayer &&
    firstLayer.kind === "image" &&
    firstLayer.rotation !== undefined
  ) {
    return firstLayer.rotation;
  }
};

describe("feather", () => {
  beforeEach(() => {
    cy.viewport(1200, 800);
  });

  it("works", () => {
    cy.mountSceneObject({
      makeObjects: (seed) => [
        makeFeather("feather", PosFns.new(500, 50), PosFns.new(1, 0), seed),
      ],
      seed: "abcd",
      debugTrace: {
        sources: (scene) => scene.getObjects(),
        colour: ({ obj }) => {
          const rotation = getFeatherRotation(obj);
          return rotation !== undefined
            ? `hsl(${rotation}, 50%, 60%)`
            : "black";
        },
      },
    });
  });

  interface FeatherPositionData {
    position: Position;
    rotation: number;
  }

  describe("falling feather", () => {
    let scenes: SceneType[];
    let debugDrawSub: Subject<(ctx: CanvasRenderingContext2D) => void>;
    let featherPositionData: FeatherPositionData[];

    const render = () => {
      cy.mountSceneObject({
        makeObjects: (seed) => [
          makeFeather("feather", PosFns.new(500, 50), PosFns.new(1, 0), seed),
        ],
        seed: "abcd",
        onSceneChange: (scene) => {
          const feather = scene.getObjects()[0];
          if (feather) {
            const position = feather.getPosition();
            const rotation = getFeatherRotation(feather);

            if (rotation !== undefined) {
              featherPositionData.push({ position, rotation });
            }
          }
        },
        debugTrace: {
          sources: (scene) => scene.getObjects(),
          colour: ({ obj }) => {
            const rotation = getFeatherRotation(obj);
            return rotation !== undefined
              ? `hsl(${rotation}, 50%, 60%)`
              : "black";
          },
        },
        debugDraw$: debugDrawSub,
      });
    };

    beforeEach(() => {
      scenes = [];
      featherPositionData = [];
      debugDrawSub = new Subject();
    });

    it("works", () => {
      if (!interactive) {
        cy.clock();
      }
      render();
      if (!interactive) {
        cy.steppedTick(25_000);
      }
      cy.percySnapshot();
    });

    describe("rotation/position", () => {
      beforeEach(() => {
        cy.clock();
        render();
        cy.steppedTick(25_000);
      });

      it("min rotation is reached at max x", () => {
        const maxX = maxBy(featherPositionData, (d) => d.position.x);
        const minRotation = minBy(featherPositionData, (d) => d.rotation);

        debugDrawSub.next((ctx) => {
          ctx.fillStyle = "darkred";
          ctx.fillRect(maxX.position.x, maxX.position.y, 10, 30);
          ctx.fillText(
            `max X (${maxX.position.x.toFixed(2)}, ${maxX.position.y.toFixed(
              2
            )})`,
            maxX.position.x,
            maxX.position.y + 50
          );

          ctx.fillStyle = "navy";
          ctx.fillRect(minRotation.position.x, minRotation.position.y, 30, 10);
          ctx.fillText(
            `min rotation ${minRotation.rotation.toFixed(2)}deg `,
            minRotation.position.x + 40,
            minRotation.position.y + 14
          );
        });

        expect(maxX.position.x - 1).to.be.lessThan(minRotation.position.x);
        expect(maxX.position.x + 1).to.be.greaterThan(minRotation.position.x);
      });

      it("max rotation is reached at min x", () => {
        const minX = minBy(featherPositionData, (d) => d.position.x);
        const maxRotation = maxBy(featherPositionData, (d) => d.rotation);

        debugDrawSub.next((ctx) => {
          ctx.fillStyle = "darkred";
          ctx.fillRect(minX.position.x, minX.position.y, 10, 30);
          ctx.fillText(
            `max X (${minX.position.x.toFixed(2)}, ${minX.position.y.toFixed(
              2
            )})`,
            minX.position.x,
            minX.position.y + 50
          );

          ctx.fillStyle = "navy";
          ctx.fillRect(maxRotation.position.x, maxRotation.position.y, 30, 10);
          ctx.fillText(
            `min rotation ${maxRotation.rotation.toFixed(2)}deg `,
            maxRotation.position.x + 40,
            maxRotation.position.y + 14
          );
        });

        expect(minX.position.x - 1).to.be.lessThan(maxRotation.position.x);
        expect(minX.position.x + 1).to.be.greaterThan(maxRotation.position.x);
      });
    });
  });
});
