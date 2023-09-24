/**
 * Applies `project` to each element in `ts` and filters out
 *   `undefined` values.
 */
export const choose = <T, U>(
  ts: readonly T[],
  project: (t: T) => U | undefined
): U[] =>
  ts
    .map(project)
    .filter((u) => u !== undefined)
    .map((u) => u as U);

export const filterUndefined = <T>(ts: readonly (T | undefined)[]): T[] => {
  return choose(ts, (v) => v);
};
