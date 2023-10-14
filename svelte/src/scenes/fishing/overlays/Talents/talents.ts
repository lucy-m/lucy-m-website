import type { AssetKey } from "../../../../model";

export type TalentId = "proficency" | "idle" | "events" | "shop";

export type TalentInfo = Readonly<{
  name: string;
  image: AssetKey;
  description: string[];
}>;

const nyiDescription = ["Coming soon..."];

export const getTalentInfo = (id: TalentId): TalentInfo => {
  switch (id) {
    case "proficency":
      return {
        name: "Learning the ropes",
        image: "talent.placeholder",
        description: [
          "As you level up you will gain more *proficiency*. This will make fishing quicker.",
          "Gain 8% *proficiency*.",
        ],
      };
    case "idle":
      return {
        name: "Incredible multitasking",
        image: "talent.placeholder",
        description: nyiDescription,
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

export type TalentRow = [
  TalentId | undefined,
  TalentId | undefined,
  TalentId | undefined
];

export type TalentTree = TalentRow[];

export const talentTree: TalentTree = [
  [undefined, "proficency", undefined],
  ["idle", "events", "shop"],
];
