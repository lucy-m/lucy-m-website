import type { PRNG } from "seedrandom";
import { PosFns, type SceneType } from "../../../model";
import { biteMarker } from "../objects/bite-marker";

const interactive = Cypress.config("isInteractive");
// const interactive = false;

describe("biteMarker", () => {
  beforeEach(() => {
    cy.viewport(1400, 900);
    if (!interactive) {
      cy.clock();
    }
  });

  it("works", () => {
    cy.mountSceneObject({
      makeObjects: (random: PRNG) => [
        biteMarker({
          position: PosFns.new(100, 100),
          onInteract: cy.spy().as("onInteractSpy"),
          random,
        }),
      ],
      debugTrace: {
        sources: (scene: SceneType) => scene.getObjects(),
        colour: () => {
          return "blue";
        },
      },
      seed: "something",
    });

    cy.interactiveWait(60_000, interactive);
  });
});
