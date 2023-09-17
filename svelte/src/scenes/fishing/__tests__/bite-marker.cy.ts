import { PosFns } from "../../../model";
import { biteMarker } from "../objects/bite-marker";

describe("biteMarker", () => {
  beforeEach(() => {
    cy.viewport(1400, 900);
  });

  it("works", () => {
    cy.mountSceneObject({
      makeObjects: (random) => [
        biteMarker({ position: PosFns.new(100, 100), random }),
      ],
      seed: "something",
    });
  });
});
