import { makeCruisingBird } from "../cruising-bird";
import ObjectFixture from "./ObjectFixture.svelte";

describe("cruising-bird", () => {
  it("works", () => {
    cy.mountWithFixture(ObjectFixture, {
      makeObject: (seed) => makeCruisingBird("bird", 200, [10, 40], seed),
      seed: "abcd",
    });
  });
});
