import {
  partitionByAllKinds,
  partitionByKind,
  type Partitioned,
  type PartitionedByAll,
} from "../partition-by-kind";

type ItemType = { kind: "a" } | { kind: "b"; value: number } | { kind: "c" };

const items: ItemType[] = [
  { kind: "a" },
  { kind: "b", value: 1 },
  { kind: "b", value: 2 },
  { kind: "a" },
  { kind: "b", value: 3 },
];

describe("partitionbyAllKinds", () => {
  it("works", () => {
    const partitioned = partitionByAllKinds(items);

    const expected: PartitionedByAll<ItemType> = {
      a: [{ kind: "a" }, { kind: "a" }],
      b: [
        { kind: "b", value: 1 },
        { kind: "b", value: 2 },
        { kind: "b", value: 3 },
      ],
    };

    expect(partitioned).to.deep.equal(expected);
  });
});

describe("partitionbyKind", () => {
  it("a works", () => {
    const partitioned = partitionByKind(items, "a");

    const expected: Partitioned<ItemType, "a"> = {
      a: [{ kind: "a" }, { kind: "a" }],
      other: [
        { kind: "b", value: 1 },
        { kind: "b", value: 2 },
        { kind: "b", value: 3 },
      ],
    };

    expect(partitioned).to.deep.equal(expected);
  });
});
