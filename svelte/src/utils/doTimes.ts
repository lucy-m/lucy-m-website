export const doTimes = (i: number, doFn: () => void): void => {
  Array.from({ length: i }).forEach(doFn);
};
