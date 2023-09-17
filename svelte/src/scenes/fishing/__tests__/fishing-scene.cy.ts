import { makeFishingScene } from "../fishing-scene";

describe("fishing scene", () => {
  describe("rendering tests", () => {
    beforeEach(() => {
      cy.viewport(1400, 900);

      cy.mountViewScene({
        initialSceneSpec: makeFishingScene({ kind: "cast-out" }),
        seed: "abcd",
      });
      cy.get("canvas").should("have.attr", "data-initialised", "true");
    });

    it("works", () => {});
  });
});
