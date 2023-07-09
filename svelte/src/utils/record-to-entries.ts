export const recordToEntries = <TKey extends string, TVal>(
  record: Record<TKey, TVal>
): (readonly [TKey, TVal])[] => {
  return Object.entries(record).map(
    ([key, value]) => [key, value] as [TKey, TVal]
  );
};

export const entriesToRecord = <TKey extends string, TVal>(
  entries: (readonly [TKey, TVal])[]
): Record<TKey, TVal> => {
  return Object.fromEntries(entries) as Record<TKey, TVal>;
};
