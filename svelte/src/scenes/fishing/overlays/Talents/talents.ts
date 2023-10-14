import type { AssetKey } from "../../../../model";

export type Talent = Readonly<{
  name: string;
  image: AssetKey;
}>;

export type TalentRow = [
  Talent | undefined,
  Talent | undefined,
  Talent | undefined
];

export type TalentTree = TalentRow[];

const placeholderTalent: Talent = {
  name: "Placeholder",
  image: "talent.placeholder",
};

export const talentTree: TalentTree = [
  [undefined, placeholderTalent, undefined],
  [placeholderTalent, undefined, placeholderTalent],
  [placeholderTalent, placeholderTalent, placeholderTalent],
];
