import type { AssetKey } from "../../../../model";
import { filterUndefined } from "../../../../utils";

export type TalentId = "proficiency" | "idle" | "events" | "shop";

export type TalentInfo = Readonly<{
  name: string;
  image: AssetKey;
  description: string[];
}>;

const nyiDescription = ["Coming soon..."];

export const getTalentDependentsSatisfied = (
  position: { row: number; column: number },
  dependencies: readonly TalentTreeDependency[],
  learned: readonly TalentId[]
): boolean => {
  const myDependency = dependencies.find(
    (d) => d.from.row === position.row && d.from.column === position.column
  );

  if (!myDependency || !myDependency.to.talentId) {
    return true;
  } else {
    return learned.includes(myDependency.to.talentId);
  }
};

export const getTalentInfo = (id: TalentId): TalentInfo => {
  switch (id) {
    case "proficiency":
      return {
        name: "Learning the ropes",
        image: "talent.placeholder",
        description: [
          "As you level up your fisherman will gain more *proficiency*. This will make fishing quicker.",
          "Gain 8% *proficiency*.",
        ],
      };
    case "idle":
      return {
        name: "Incredible multitasking",
        image: "talent.placeholder",
        description: [
          "While you're fishing you can also do other things. Like, for example, fishing.",
          "Your fisherman will automatically fish for you (at a very gentle pace, as they are a bit of a slacker).",
        ],
      };
    case "events":
      return {
        name: "My lucky day",
        image: "talent.placeholder",
        description: nyiDescription,
      };
    case "shop":
      return {
        name: "I ❤️ cosmetics",
        image: "talent.placeholder",
        description: nyiDescription,
      };
    default:
      return {
        name: "Unknown",
        image: "talent.placeholder",
        description: [
          "You shouldn't be seeing this text... so congratulations if you have found it.",
        ],
      };
  }
};

export type TalentRowEntry = Readonly<{
  id: TalentId;
  dependsOn?: 0 | 1 | 2;
}>;

export type TalentRow = [
  TalentRowEntry | undefined,
  TalentRowEntry | undefined,
  TalentRowEntry | undefined
];

export type TalentTree = TalentRow[];

export const talentTree: TalentTree = [
  [undefined, { id: "proficiency" }, undefined],
  [
    { id: "idle", dependsOn: 1 },
    { id: "events", dependsOn: 1 },
    { id: "shop", dependsOn: 1 },
  ],
];

export type TalentTreeDependency = Readonly<{
  from: { row: number; column: number };
  to: { row: number; column: number; talentId: TalentId | undefined };
}>;

export const getDependencies = (
  talentTree: TalentTree
): readonly TalentTreeDependency[] => {
  return talentTree.reduce((acc, row, rowIndex) => {
    const rowResults: TalentTreeDependency[] = filterUndefined(
      row.map((item, colIndex) => {
        const toColumn = item?.dependsOn;

        if (toColumn === undefined) {
          return undefined;
        } else {
          return {
            from: { row: rowIndex, column: colIndex },
            to: {
              row: rowIndex - 1,
              column: toColumn,
              talentId: talentTree[rowIndex - 1]?.[toColumn]?.id,
            },
          };
        }
      })
    );

    return [...acc, ...rowResults];
  }, [] as TalentTreeDependency[]);
};
