import { makeCruisingBird } from "../cruising-bird";
import ObjectFixture from "./ObjectFixture.svelte";

describe("cruising bird", () => {
  beforeEach(() => {
    cy.viewport(1200, 800);
  });

  it.only("works", () => {
    cy.mount(ObjectFixture, {
      props: {
        makeObjects: (seed) => [
          makeCruisingBird("bird", 10, [100, 400], seed),
          makeCruisingBird("bird", 10, [400, 700], seed),
        ],
        seed: "abcd",
        debugTrace: {
          sources: (scene) => scene.objects,
          colour: ({ index }) => {
            switch (index) {
              case 0:
                return "mediumaquamarine";
              case 1:
                return "darkred";
            }
          },
        },
      },
    });
  });
});
