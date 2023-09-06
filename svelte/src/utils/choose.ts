export const choose = <T, U>(
  ts: readonly T[],
  project: (t: T) => U | undefined
): U[] =>
  ts
    .map(project)
    .filter((u) => u !== undefined)
    .map((u) => u as U);
