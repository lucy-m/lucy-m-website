import { makeFishingScene } from "../fishing/fishing-scene";
import ViewSceneFixture from "./ViewSceneFixture.svelte";

describe("fishing scene", () => {
  describe("rendering tests", () => {
    beforeEach(() => {
      cy.viewport(1400, 900);

      cy.mount(ViewSceneFixture, {
        props: {
          makeScene: makeFishingScene,
          seed: "abcd",
        },
      });
      cy.get("canvas").should("have.attr", "data-initialised", "true");
    });

    it("works", () => {});
  });
});
