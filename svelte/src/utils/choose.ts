export const choose = <T, U>(
  ts: readonly T[],
  project: (t: T) => U | undefined | false
): U[] =>
  ts
    .map(project)
    .filter((u) => u !== undefined && u !== false)
    .map((u) => u as U);
