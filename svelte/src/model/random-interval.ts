import { concatMap, map, of, repeat, timer, type Observable } from "rxjs";

export const randomInterval = (
  range: readonly [number, number]
): Observable<void> => {
  const min = Math.min(range[0], range[1]);
  const max = Math.max(range[0], range[1]);

  return of("").pipe(
    concatMap(() => {
      return timer(Math.random() * (max - min) + min);
    }),
    map(() => {}),
    repeat()
  );
};
