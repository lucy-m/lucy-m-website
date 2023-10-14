import { loadImages, type AssetKey } from "../../../../model";
import { Talents } from "../Talents";

describe("talents", () => {
  let images: Record<AssetKey, ImageBitmap>;

  beforeEach(() => {
    cy.viewport(800, 600);
  });

  beforeEach((done) => {
    loadImages().then((i) => {
      images = i;
      done();
    });
  });

  describe("some scenario", () => {
    beforeEach(() => {
      cy.mount(Talents, { props: { images } });
    });

    it.only("works", () => {});
  });
});
