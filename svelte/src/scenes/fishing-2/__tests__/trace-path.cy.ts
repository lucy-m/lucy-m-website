import type { PRNG } from "seedrandom";
import { tracePath } from "../trace-path";

describe("tracePath", () => {
  it("works", () => {
    cy.mountSceneObject({
      makeObjects: (random: PRNG) => [tracePath({ random })],
      seed: "xyz",
    });
  });
});
