import { PosFns, loadImages } from "../../../model";
import CanvasDrawFixture from "./CanvasDrawFixture.svelte";

describe("canvas-draw", () => {
  beforeEach(async () => {
    const images = await loadImages();

    cy.mount(CanvasDrawFixture, {
      props: {
        drawLayer: {
          content: {
            kind: "image",
            image: images["houseSmall"],
          },
          position: PosFns.new(10, 20),
        },
      },
    });
  });

  beforeEach(() => {
    cy.get("canvas").should("have.attr", "data-initialised", "true");
  });

  it("works", () => {
    cy.percySnapshot();
  });
});
