export const levelToProficiency = (level: number): number => {
  if (level <= 1) {
    return 1;
  }
  return Math.pow(0.98, level - 1);
};
