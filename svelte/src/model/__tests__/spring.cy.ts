import { Subject, map, type Observable } from "rxjs";
import type { PRNG } from "seedrandom";
import { PosFns, type Position } from "../position";
import { makeSceneObject } from "../scene-object";
import type { SceneObject } from "../scene-types";
import {
  NumberSpringFns,
  PositionSpringFns,
  type NumberSpring,
} from "../spring";

describe("spring", () => {
  it("ticking moves item", () => {
    const springA: NumberSpring = NumberSpringFns.make({
      position: 0,
      endPoint: 100,
      velocity: 0,
      properties: {
        friction: 0.2,
        precision: 0.1,
        stiffness: 0.1,
        weight: 0.1,
      },
    });

    const tickedA = NumberSpringFns.tick(springA, 1);

    expect(tickedA.position).to.be.greaterThan(springA.position);
  });

  it("ticking more moves item more", () => {
    const springA = NumberSpringFns.make({
      position: 0,
      endPoint: 100,
      velocity: 0,
      properties: {
        friction: 0.2,
        precision: 0.1,
        stiffness: 0.1,
        weight: 0.1,
      },
    });

    const tickedA = NumberSpringFns.tick(springA, 1);
    const tickedB = NumberSpringFns.tick(springA, 2);

    expect(tickedB.position).to.be.greaterThan(tickedA.position);
  });

  describe("rendering tests", () => {
    const interactive = Cypress.config("isInteractive");
    // const interactive = false;

    beforeEach(() => {
      if (!interactive) {
        cy.clock();
      }
    });

    describe("number springs", () => {
      const makeSpringSceneObject = (args: {
        initial: number;
        endPoint: Observable<number>;
        random: PRNG;
      }): SceneObject => {
        let yPosition = 100;

        let xPosition = NumberSpringFns.make({
          position: args.initial,
          endPoint: args.initial,
          velocity: 0,
          properties: {
            friction: 4,
            precision: 0.1,
            stiffness: 0.4,
            weight: 0.2,
          },
        });

        const sub = args.endPoint.subscribe((endPoint) => {
          xPosition = NumberSpringFns.set(xPosition, { endPoint });
        });

        return makeSceneObject(args.random)({
          getPosition: () => PosFns.new(xPosition.position, yPosition),
          getLayers: () => [
            {
              kind: "image",
              subLayer: "background",
              assetKey: "feather1",
            },
          ],
          layerKey: "test",
          onTick: () => {
            xPosition = NumberSpringFns.tick(xPosition, 0.2);
            yPosition += 2;
          },
          onDestroy: () => {
            sub.unsubscribe();
          },
        });
      };

      it.only("works", () => {
        let endPointCount = 0;
        const endPointSub = new Subject<number>();

        const setEndPoint = (pos: number) => {
          endPointCount++;
          endPointSub.next(pos);
        };

        const debugDraw$ = endPointSub.pipe(
          map((endPoint) => (ctx: CanvasRenderingContext2D) => {
            ctx.beginPath();
            ctx.ellipse(
              endPoint,
              endPointCount * 80,
              10,
              10,
              0,
              0,
              2 * Math.PI
            );
            ctx.stroke();
          })
        );

        cy.mountSceneObject({
          makeObjects: (random) => [
            makeSpringSceneObject({
              random,
              initial: 100,
              endPoint: endPointSub,
            }),
          ],
          seed: "zzz",
          debugTrace: {
            sources: (scene) => scene.getObjects(),
            colour: () => {
              return `hsl(${endPointCount * 80}, 80%, 50%)`;
            },
          },
          debugDraw$,
        });

        cy.interactiveWait(500, interactive).then(() => {
          setEndPoint(200);
        });

        cy.interactiveWait(3000, interactive).then(() => {
          setEndPoint(1000);
        });

        cy.interactiveWait(1500, interactive).then(() => {
          setEndPoint(400);
        });

        cy.interactiveWait(8000, interactive);

        cy.percySnapshot();
      });
    });

    describe("position springs", () => {
      const makeSpringSceneObject = (args: {
        initial: Position;
        endPoint: Observable<Position>;
        random: PRNG;
      }): SceneObject => {
        let position = PositionSpringFns.make({
          position: args.initial,
          endPoint: args.initial,
          velocity: PosFns.zero,
          properties: {
            friction: 4,
            precision: 0.1,
            stiffness: 0.4,
            weight: 0.2,
          },
        });

        const sub = args.endPoint.subscribe((endPoint) => {
          position = PositionSpringFns.set(position, { endPoint });
        });

        return makeSceneObject(args.random)({
          getPosition: () => position.position,
          getLayers: () => [
            {
              kind: "image",
              subLayer: "background",
              assetKey: "feather1",
            },
          ],
          layerKey: "test",
          onTick: () => {
            position = PositionSpringFns.tick(position, 0.2);
          },
          onDestroy: () => {
            sub.unsubscribe();
          },
        });
      };

      it("works", () => {
        let endPointCount = 0;
        const endPointSub = new Subject<Position>();

        const setEndPoint = (pos: Position) => {
          endPointCount++;
          endPointSub.next(pos);
        };

        const debugDraw$ = endPointSub.pipe(
          map((endPoint) => (ctx: CanvasRenderingContext2D) => {
            ctx.beginPath();
            ctx.ellipse(endPoint.x, endPoint.y, 10, 10, 0, 0, 2 * Math.PI);
            ctx.stroke();
          })
        );

        cy.mountSceneObject({
          makeObjects: (random) => [
            makeSpringSceneObject({
              random,
              initial: PosFns.new(50, 100),
              endPoint: endPointSub,
            }),
          ],
          seed: "zzz",
          debugTrace: {
            sources: (scene) => scene.getObjects(),
            colour: () => {
              return `hsl(${endPointCount * 80}, 80%, 50%)`;
            },
          },
          debugDraw$,
        });

        cy.interactiveWait(500, interactive).then(() => {
          setEndPoint(PosFns.new(800, 120));
        });

        cy.interactiveWait(3000, interactive).then(() => {
          setEndPoint(PosFns.new(400, 800));
        });

        cy.interactiveWait(1500, interactive).then(() => {
          setEndPoint(PosFns.new(1200, 600));
        });

        cy.interactiveWait(8000, interactive);

        cy.percySnapshot();
      });
    });
  });
});
