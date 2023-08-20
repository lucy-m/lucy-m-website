import { concatMap, map, of, repeat, timer, type Observable } from "rxjs";
import type { PRNG } from "seedrandom";

export const randomInterval = (
  range: readonly [number, number],
  random: PRNG
): Observable<void> => {
  const min = Math.min(range[0], range[1]);
  const max = Math.max(range[0], range[1]);

  return of("").pipe(
    concatMap(() => {
      return timer(random.quick() * (max - min) + min);
    }),
    map(() => {}),
    repeat()
  );
};
