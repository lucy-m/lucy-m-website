import { PosFns } from "../position";
import { getRotations, isConvex } from "../shape";

describe("getRotations", () => {
  it("[]", () => {
    expect(getRotations([])).to.deep.equal([]);
  });

  it("[1]", () => {
    expect(getRotations([1])).to.deep.equal([[1]]);
  });

  it("[0,1,2]", () => {
    const expected = [
      [0, 1, 2],
      [1, 2, 0],
      [2, 0, 1],
    ];

    expect(getRotations([0, 1, 2])).to.deep.equal(expected);
  });
});

describe("isConvex", () => {
  it("[]", () => {
    expect(isConvex([])).to.be.false;
  });

  it("triangle", () => {
    const triangle = [PosFns.zero, PosFns.new(10, -10), PosFns.new(-5, -15)];

    expect(isConvex(triangle)).to.be.true;
  });

  it("square", () => {
    const square = [
      PosFns.zero,
      PosFns.new(1, 0),
      PosFns.new(1, 1),
      PosFns.new(0, 1),
    ];

    expect(isConvex(square)).to.be.true;
  });

  it("M", () => {
    const m = [
      PosFns.zero,
      PosFns.new(2, 0),
      PosFns.new(2, 2),
      PosFns.new(1, 1),
      PosFns.new(0, 2),
    ];

    expect(isConvex(m)).to.be.false;
  });
});
