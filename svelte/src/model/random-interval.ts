import { concatMap, map, of, repeat, timer, type Observable } from "rxjs";
import type { PRNG } from "seedrandom";
import { randomBetween } from "./random-between";

export const randomInterval = (
  range: { min: number; max: number },
  random: PRNG
): Observable<void> => {
  return of("").pipe(
    concatMap(() => {
      return timer(randomBetween(range, random));
    }),
    map(() => {}),
    repeat()
  );
};
