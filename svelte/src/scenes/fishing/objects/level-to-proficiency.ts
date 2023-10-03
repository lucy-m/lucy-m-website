export const levelToProficiency = (level: number): number => {
  return Math.pow(0.98, level - 1);
};
