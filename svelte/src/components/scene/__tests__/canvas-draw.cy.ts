import { PosFns, loadImages } from "../../../model";
import CanvasDrawFixture from "./CanvasDrawFixture.svelte";

describe("canvas-draw", () => {
  it("works", () => {
    loadImages().then((images) => {
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
  });
});
