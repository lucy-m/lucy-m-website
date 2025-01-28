import { PosFns, type Position } from "../position";

describe("position", () => {
  describe("linearInterpolate", () => {
    describe("test cases", () => {
      type TestCase = {
        pos1: Position;
        pos2: Position;
        expected: Position[];
      };

      const testCases: TestCase[] = [
        {
          pos1: PosFns.zero,
          pos2: PosFns.new(10, 10),
          expected: [
            PosFns.new(-1, -1),
            PosFns.new(1, 1),
            PosFns.new(8, 8),
            PosFns.new(10, 10),
            PosFns.new(11, 11),
          ],
        },
        {
          pos2: PosFns.new(0, 10),
          pos1: PosFns.new(10, 0),
          expected: [
            PosFns.new(-1, 11),
            PosFns.new(1, 9),
            PosFns.new(8, 2),
            PosFns.new(11, -1),
          ],
        },
        {
          pos2: PosFns.new(0, 8),
          pos1: PosFns.new(10, 8),
          expected: [PosFns.new(-1, 8), PosFns.new(1, 8), PosFns.new(8, 8)],
        },
      ];

      testCases.forEach((testCase) => {
        describe(`interpolating between ${PosFns.toString(
          testCase.pos1
        )} and ${PosFns.toString(testCase.pos2)}`, () => {
          testCase.expected.forEach((input) => {
            it(input.x + " = " + input.y, () => {
              expect(
                PosFns.linearInterpolate(testCase.pos1, testCase.pos2, input.x)
              ).to.eq(input.y);
            });
          });
        });
      });
    });

    it("interpolating along vertical line returns 0", () => {
      const pos1 = PosFns.new(6, 0);
      const pos2 = PosFns.new(6, 10);

      expect(PosFns.linearInterpolate(pos1, pos2, 3)).to.eq(0);
    });
  });
});
