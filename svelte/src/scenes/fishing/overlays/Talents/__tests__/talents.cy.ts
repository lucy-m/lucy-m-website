import { getDependencies, type TalentTree } from "../talents";

describe("getDependencies", () => {
  it("works", () => {
    const talentTree: TalentTree = [
      [undefined, { id: "proficiency" }, undefined],
      [
        { id: "idle", dependsOn: 1 },
        { id: "events", dependsOn: 2 },
        { id: "shop", dependsOn: 1 },
      ],
      [
        {
          id: "proficiency",
          dependsOn: 2,
        },
        undefined,
        undefined,
      ],
    ];

    const result = getDependencies(talentTree);

    const expected: ReturnType<typeof getDependencies> = [
      {
        from: { row: 1, column: 0 },
        to: { row: 0, column: 1, talentId: "proficiency" },
      },
      {
        from: { row: 1, column: 1 },
        to: { row: 0, column: 2, talentId: undefined },
      },
      {
        from: { row: 1, column: 2 },
        to: { row: 0, column: 1, talentId: "proficiency" },
      },
      {
        from: { row: 2, column: 0 },
        to: { row: 1, column: 2, talentId: "shop" },
      },
    ];

    expect(result).to.deep.equal(expected);
  });
});
