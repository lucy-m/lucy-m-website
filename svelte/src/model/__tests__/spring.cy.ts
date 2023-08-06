import { NumberSpringFns, type NumberSpring } from "../spring";

describe("spring", () => {
  it("ticking moves item", () => {
    const springA: NumberSpring = NumberSpringFns.make({
      position: 0,
      endPoint: 100,
      velocity: 0,
      properties: {
        friction: 0.2,
        precision: 0.1,
        stiffness: 0.1,
        weight: 0.1,
      },
    });

    const tickedA = NumberSpringFns.tick(springA, 1);

    expect(tickedA.position).to.be.greaterThan(springA.position);
  });

  it("ticking more moves item more", () => {
    const springA = NumberSpringFns.make({
      position: 0,
      endPoint: 100,
      velocity: 0,
      properties: {
        friction: 0.2,
        precision: 0.1,
        stiffness: 0.1,
        weight: 0.1,
      },
    });

    const tickedA = NumberSpringFns.tick(springA, 1);
    const tickedB = NumberSpringFns.tick(springA, 2);

    expect(tickedB.position).to.be.greaterThan(tickedA.position);
  });
});
