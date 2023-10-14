type Talent = Readonly<{
  name: string;
}>;

type TalentRow = [Talent | undefined, Talent | undefined, Talent | undefined];

type TalentTree = TalentRow[];

const placeholderTalent: Talent = { name: "Placeholder" };

export const talentTree: TalentTree = [
  [undefined, placeholderTalent, undefined],
  [placeholderTalent, undefined, placeholderTalent],
  [placeholderTalent, placeholderTalent, placeholderTalent],
];
