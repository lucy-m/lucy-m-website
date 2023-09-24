import { filter, map, pipe, type OperatorFunction } from "rxjs";

/**
 * Applies `project` to each element and filters out
 *   `undefined` or `false` values.
 */
export const chooseOp = <T, U>(
  project: (t: T) => U | undefined | false
): OperatorFunction<T, U> =>
  pipe(
    map(project),
    filter((value) => value !== undefined && value !== false),
    map((value) => value as U)
  );
