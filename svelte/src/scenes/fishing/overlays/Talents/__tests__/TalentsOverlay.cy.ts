import { TalentsOverlay } from "..";
import { loadImages, type AssetKey } from "../../../../../model";

describe("TalentsOverlay", () => {
  let images: Record<AssetKey, ImageBitmap>;

  const getTalentViewer = () => cy.getByTestId("talent-viewer");
  const getTalentSquares = () => cy.get("canvas");

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
      cy.mount(TalentsOverlay, { props: { images } });
    });

    it("displays all talents correctly", () => {
      getTalentSquares().should("have.length", 4);
      cy.percySnapshot();
    });

    it("does not display talent viewer", () => {
      getTalentViewer().should("not.exist");
    });

    describe("selecting the first talent", () => {
      beforeEach(() => {
        getTalentSquares().eq(0).click();
      });

      it("displays talents correctly", () => {
        cy.percySnapshot();
      });

      it.only("displays correct item in talent viewer panel", () => {
        getTalentViewer().should("contain.text", "Learning the ropes");
      });

      describe("selecting another item", () => {
        beforeEach(() => {
          getTalentSquares().eq(1).click();
        });

        it("displays correct item in talent viewer panel", () => {
          getTalentViewer().should("contain.text", "Incredible multitasking");
        });
      });
    });
  });
});
