import { interval, map, merge, Observable, scan, startWith } from "rxjs";
import {
  NumberSpringFns,
  PositionSpringFns,
  type Spring,
  type SpringFns,
} from "./spring";

export type SpringEvent<T> =
  | {
      kind: "set";
      set: Partial<Spring<T>>;
    }
  | { kind: "update"; update: (current: Spring<T>) => Partial<Spring<T>> };

const makeSpringObservable =
  <T>(springFns: SpringFns<T>) =>
  (
    initial: Parameters<SpringFns<T>["make"]>[0],
    events$: Observable<SpringEvent<T>>
  ): Observable<Spring<T>> => {
    const dt = 25;

    const tick$ = interval(dt);

    const spring$ = merge(
      events$,
      tick$.pipe(map(() => ({ kind: "tick" } as const)))
    ).pipe(
      scan((current, next) => {
        switch (next.kind) {
          case "tick":
            return springFns.tick(current, 1);
          case "set":
            return springFns.set(current, next.set);
          case "update":
            return springFns.set(current, next.update(current));
        }
      }, springFns.make(initial)),
      startWith(springFns.make(initial))
    );

    return spring$;
  };

export const makePositionSpring = makeSpringObservable(PositionSpringFns);
export const makeNumberSpring = makeSpringObservable(NumberSpringFns);
