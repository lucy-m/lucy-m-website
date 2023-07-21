import { interval } from "rxjs";
import { writable, type Readable } from "svelte/store";
import {
  NumberSpringFns,
  PositionSpringFns,
  setSpring,
  type Spring,
  type SpringTickFn,
} from "./spring";

type SpringStore<T> = Readable<Spring<T>> & {
  set: (value: Parameters<typeof setSpring<T>>[1]) => void;
};

const makeSpringStore =
  <T>(tick: SpringTickFn<T>) =>
  (initial: Spring<T>): SpringStore<T> => {
    const value = writable<Spring<T>>(initial);
    const dt = 16;

    const subscription = interval(dt).subscribe(() => {
      value.update((current) => tick(current, dt));
    });

    // Need teardown logic to unsubscribe

    const set = (newValue: Parameters<typeof setSpring<T>>[1]) => {
      value.update((current) => setSpring(current, newValue));
    };

    return { set, subscribe: value.subscribe };
  };

export const makePositionSpring = makeSpringStore(PositionSpringFns.tick);
export const makeNumberSpring = makeSpringStore(NumberSpringFns.tick);
