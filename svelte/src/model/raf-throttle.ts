import { exhaustMap, from, map, type OperatorFunction } from "rxjs";

/**
 * Request animation frame throttle
 * Throttles the source output according to window.requestAnimationFrame
 * */
export const rafThrottle = <T>(): OperatorFunction<T, T> =>
  exhaustMap((value: T) => {
    const animationFramePromise = new Promise<void>((resolve) => {
      window.requestAnimationFrame(() => {
        resolve();
      });
    });

    return from(animationFramePromise).pipe(map(() => value));
  });
