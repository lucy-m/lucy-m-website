import { makeFishingScene } from "../fishing";
import ViewSceneFixture from "./ViewSceneFixture.svelte";

describe("fishing scene", () => {
  it("works", () => {
    cy.mount(ViewSceneFixture, {
      props: {
        makeScene: makeFishingScene,
        seed: "zugzug",
      },
    });
  });
});
