import { interval, of, Subject } from "rxjs";
import type { PRNG } from "seedrandom";
import { PosFns, type SceneObject } from "../../../../model";
import type { UserInteraction } from "../../../../model/user-interactions";
import { doTimes } from "../../../../utils";
import { presetPaths } from "../trace-paths/preset-paths";
import { makeTracePathMarker } from "../trace-paths/trace-path";

const interactive = Cypress.config("isInteractive");

describe("tracePath", () => {
  it("markers change over ticks", () => {
    cy.mountSceneObject({
      layerOrder: ["path-marker"],
      seed: "xyz",
      tick$: of(),
      makeObjects: (random: PRNG) => {
        const markers = Array.from({ length: 12 }).map((_, i) => {
          const x = 100 + (i % 6) * 180;
          const y = Math.floor(i / 6) * 180 + 100;

          const marker = makeTracePathMarker({
            random,
            position: { x, y },
            onPop: () => {},
          });

          if (i > 0) {
            marker.onPointerMove?.();
            doTimes(i - 1, () => marker.onTick?.());
          }

          return marker;
        });

        return markers;
      },
    });

    cy.get("canvas").should("have.attr", "data-initialised", "true");
    cy.percySnapshot();
  });

  describe.only("presetPaths fish", () => {
    let allObjs: readonly SceneObject[] | undefined;
    let markerObjs: readonly SceneObject[] | undefined;
    let userInteractions$: Subject<UserInteraction>;
    let debugDraw$: Subject<(ctx: CanvasRenderingContext2D) => void>;

    const popMarker = (marker: SceneObject): void => {
      const pointerMovePosition = PosFns.add(
        marker.getPosition(),
        PosFns.new(40, 40)
      );

      debugDraw$.next((ctx) => {
        ctx.beginPath();
        ctx.fillStyle = "red";
        ctx.ellipse(
          pointerMovePosition.x,
          pointerMovePosition.y,
          5,
          5,
          0,
          0,
          2 * Math.PI
        );
        ctx.fill();
      });

      userInteractions$.next({
        kind: "pointermove",
        position: pointerMovePosition,
      });
    };

    beforeEach(() => {
      markerObjs = undefined;
      allObjs = undefined;
      userInteractions$ = new Subject();
      debugDraw$ = new Subject();

      cy.mountSceneObject({
        layerOrder: ["trace-path", "path-marker"],
        seed: "abc",
        makeObjects: (random: PRNG) => [
          presetPaths.fish({
            random,
            position: PosFns.new(0, 0),
          }),
        ],
        onSceneChange: (scene) => {
          allObjs = scene.getObjects();
          markerObjs = allObjs?.filter((obj) => obj.typeName === "path-marker");
        },
        userInteractions$,
        tick$: interval(100),
        debugDraw$,
      });
    });

    describe("pointermove marker", () => {
      let markerCount: number;

      beforeEach(() => {
        const marker = markerObjs?.[0];

        if (!markerObjs || !marker) {
          throw new Error("No path marker to act on");
        }

        markerCount = markerObjs.length;

        popMarker(marker);
      });

      describe("marker is removed", () => {
        beforeEach(() => {
          cy.myWaitFor(() => {
            return markerObjs?.length === markerCount - 1;
          }, interactive);
        });

        it("works", () => {
          // Assertion done in beforeEach above
        });

        describe("removing remaining markers", () => {
          beforeEach(() => {
            if (!markerObjs) {
              throw new Error("No path markers to act on");
            }

            markerObjs.forEach(popMarker);

            cy.myWaitFor(() => {
              return markerObjs?.length === 0;
            }, interactive);
          });

          it("removes self", () => {
            expect(allObjs).to.have.length(0);
          });
        });
      });
    });
  });
});
