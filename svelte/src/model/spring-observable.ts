import { interval, map, merge, Observable, scan } from "rxjs";
import {
  NumberSpringFns,
  PositionSpringFns,
  setSpring,
  type Spring,
  type SpringTickFn,
} from "./spring";

export type SpringEvent<T> =
  | {
      kind: "set";
      set: Partial<Spring<T>>;
    }
  | { kind: "update"; update: (current: Spring<T>) => Partial<Spring<T>> };

const makeSpringObservable =
  <T>(tick: SpringTickFn<T>) =>
  (
    initial: Spring<T>,
    events$: Observable<SpringEvent<T>>
  ): Observable<Spring<T>> => {
    const dt = 32;

    const tick$ = interval(dt);

    const spring$ = merge(
      events$,
      tick$.pipe(map(() => ({ kind: "tick" } as const)))
    ).pipe(
      scan((current, next) => {
        switch (next.kind) {
          case "tick":
            return tick(current, dt);
          case "set":
            return setSpring(current, next.set);
          case "update":
            return setSpring(current, next.update(current));
        }
      }, initial)
    );

    return spring$;
  };

export const makePositionSpring$ = makeSpringObservable(PositionSpringFns.tick);
export const makeNumberSpring$ = makeSpringObservable(NumberSpringFns.tick);
