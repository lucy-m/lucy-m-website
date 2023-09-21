import {
  distinctUntilChanged,
  interval,
  map,
  merge,
  Observable,
  scan,
  share,
  startWith,
} from "rxjs";
import { rafThrottle } from "./raf-throttle";
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
    const dt = 30;

    const tick$ = interval(dt);

    const initialSpring = springFns.make(initial);

    const springUpdates$ = merge(
      events$,
      tick$.pipe(map(() => ({ kind: "tick" } as const)))
    ).pipe(
      scan((current, next) => {
        switch (next.kind) {
          case "tick":
            return springFns.tick(current, dt / 25);
          case "set":
            return springFns.set(current, next.set);
          case "update":
            return springFns.set(current, next.update(current));
        }
      }, initialSpring),
      distinctUntilChanged(),
      rafThrottle()
    );

    return springUpdates$.pipe(startWith(initialSpring), share());
  };

export const makePositionSpring = makeSpringObservable(PositionSpringFns);
export const makeNumberSpring = makeSpringObservable(NumberSpringFns);
