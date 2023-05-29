import { PosFns } from "../position";
import { getBoundingBox, getRotations, isConvex, pointInShape } from "../shape";

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

  it("polygon", () => {
    const polygon = [
      PosFns.new(-1, -1),
      PosFns.new(2, 0),
      PosFns.new(3, 3),
      PosFns.new(1, 4),
      PosFns.new(-2, 2),
    ];

    expect(isConvex(polygon)).to.be.true;
  });
});

describe("pointInShape", () => {
  describe("triangle", () => {
    const triangle = [PosFns.zero, PosFns.new(10, 0), PosFns.new(10, 8)];

    it("(5,1)", () => {
      expect(pointInShape(triangle, PosFns.new(5, 1))).to.be.true;
    });

    it("(0,0)", () => {
      expect(pointInShape(triangle, PosFns.new(1, 1))).to.be.false;
    });

    it("(8,8)", () => {
      expect(pointInShape(triangle, PosFns.new(8, 8))).to.be.false;
    });
  });
});

describe("getBoundingBox", () => {
  it("triangle", () => {
    const triangle = [PosFns.zero, PosFns.new(10, 0), PosFns.new(10, 8)];

    const expected = {
      min: PosFns.zero,
      max: PosFns.new(10, 8),
    };

    expect(getBoundingBox(triangle)).to.deep.equal(expected);
  });

  it("polygon", () => {
    const polygon = [
      PosFns.new(-1, -1),
      PosFns.new(2, 0),
      PosFns.new(3, 3),
      PosFns.new(1, 4),
      PosFns.new(-2, 2),
    ];

    const expected = {
      min: PosFns.new(-2, -1),
      max: PosFns.new(3, 4),
    };

    expect(getBoundingBox(polygon)).to.deep.equal(expected);
  });
});
