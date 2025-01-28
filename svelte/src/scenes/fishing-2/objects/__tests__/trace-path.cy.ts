import { of } from "rxjs";
import type { PRNG } from "seedrandom";
import { doTimes } from "../../../../utils";
import { makeTracePathMarker } from "../trace-paths/trace-path";

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
});
