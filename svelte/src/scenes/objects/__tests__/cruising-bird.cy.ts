import { makeCruisingBird } from "../cruising-bird";
import ObjectFixture from "./ObjectFixture.svelte";

const interactive = Cypress.config("isInteractive");

describe("cruising bird", () => {
  beforeEach(() => {
    cy.viewport(1200, 800);
    if (!interactive) {
      cy.clock();
    }
  });

  it("works", () => {
    cy.mount(ObjectFixture, {
      props: {
        makeObjects: (seed) => [
          makeCruisingBird("bird", 10, [100, 400], seed),
          makeCruisingBird("bird", 10, [400, 700], seed),
          makeCruisingBird("bird", 10, [700, 1000], seed),
        ],
        seed: "abcde",
        debugTrace: {
          sources: (scene) => scene.objects,
          colour: ({ obj, index }) => {
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
      },
    });
    cy.get("canvas").should("have.attr", "data-initialised", "true");

    if (!interactive) {
      cy.steppedTick(30_000);
      cy.percySnapshot();
    }
  });
});
