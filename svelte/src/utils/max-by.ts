export const maxBy = <T>(ts: T[], projectFn: (t: T) => number): T => {
  return ts.reduce((a, b) => (projectFn(a) > projectFn(b) ? a : b));
};

export const minBy = <T>(ts: T[], projectFn: (t: T) => number): T =>
  maxBy(ts, (t) => -projectFn(t));
