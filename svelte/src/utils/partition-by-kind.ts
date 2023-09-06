type TestInterface =
  | {
      kind: "a";
    }
  | {
      kind: "b";
      someData: number;
    }
  | {
      kind: "c";
      otherData: string;
    };

export type Partitioned<T extends { kind: string }, TKey extends T["kind"]> = {
  [K in TKey]: readonly Extract<T, { kind: TKey }>[];
} & {
  other: readonly Exclude<T, { kind: TKey }>[];
};

export type PartitionedByAll<T extends { kind: string }> = {
  [K in T["kind"]]?: readonly Extract<T, { kind: K }>[];
};

export const partitionByKind = <
  T extends { kind: string },
  TKey extends T["kind"]
>(
  values: readonly T[],
  key: TKey
): Partitioned<T, TKey> => {
  const items: Record<string, T[]> = {
    [key]: [],
    other: [],
  };

  values.forEach((value) => {
    if (value.kind === key) {
      items[key].push(value);
    } else {
      items.other.push(value);
    }
  });

  return items as unknown as Partitioned<T, TKey>;
};

export const partitionByAllKinds = <T extends { kind: string }>(
  values: readonly T[]
): PartitionedByAll<T> => {
  const items: Record<string, unknown[]> = {};

  values.forEach((value) => {
    if (!(value.kind in items)) {
      items[value.kind] = [];
    }
    items[value.kind].push(value);
  });

  return items as PartitionedByAll<T>;
};
