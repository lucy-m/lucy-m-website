export type FetchState<T> =
  | {
      kind: "loading";
    }
  | { kind: "loaded"; data: T }
  | { kind: "error"; error: unknown };
