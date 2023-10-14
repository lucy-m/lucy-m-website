import { getDependencies, talentTree } from "../talents";

describe("getDependencies", () => {
  it("works", () => {
    const result = getDependencies(talentTree);

    const expected: ReturnType<typeof getDependencies> = [
      { from: { row: 1, column: 0 }, to: { row: 0, column: 1 } },
      { from: { row: 1, column: 1 }, to: { row: 0, column: 1 } },
      { from: { row: 1, column: 2 }, to: { row: 0, column: 1 } },
    ];

    expect(result).to.deep.equal(expected);
  });
});
