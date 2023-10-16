import { choose } from "../../../utils";
import type { TalentId } from "../overlays/Talents/talents";

export const calcProficiency = (args: {
  level: number;
  talents: readonly TalentId[];
}): number => {
  const { level, talents } = args;

  if (level <= 1) {
    return 1;
  }
  const levelProficiency = Math.pow(1.02, level - 1);

  const talentProficiency = choose(talents, (t) => {
    if (t === "proficiency") {
      return 0.08;
    } else {
      return undefined;
    }
  }).reduce((a, b) => a + b, 0);

  const totalProficiency = levelProficiency + talentProficiency;

  return 1 / totalProficiency;
};
