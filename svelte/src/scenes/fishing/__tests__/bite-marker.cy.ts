import { PosFns } from "../../../model";
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
      makeObjects: (random) => [
        biteMarker({
          position: PosFns.new(100, 100),
          onInteract: cy.spy().as("onInteractSpy"),
          random,
        }),
      ],
      debugTrace: {
        sources: (scene) => scene.getObjects(),
        colour: ({ obj }) => {
          return "blue";
        },
      },
      seed: "something",
    });

    cy.interactiveWait(60_000, interactive);
  });
});
