import fc from "fast-check";
import seedrandom from "seedrandom";
import { PosFns } from "../position";
import { randomBetween, randomBetweenPosition } from "../random-between";

describe("randomBetween", () => {
  describe("generates points between values", () => {
    fc.assert(
      fc.property(fc.float(), fc.float(), fc.string(), (n1, n2, seed) => {
        it(`numbers ${n1.toFixed(2)} ${n2.toFixed(2)} seed ${seed}`, () => {
          const max = Math.max(n1, n2);
          const min = Math.min(n1, n2);

          const r = randomBetween({ max, min }, seedrandom(seed));

          expect(r).to.be.gte(min);
          expect(r).to.be.lte(max);
        });
      })
    );
  });
});

describe("randomBetweenPosition", () => {
  describe("generates positions between values", () => {
    fc.assert(
      fc.property(
        fc.float(),
        fc.float(),
        fc.float(),
        fc.float(),
        fc.string(),
        (x1, x2, y1, y2, seed) => {
          it(`numbers ${x1} ${x2} ${y1} ${y2} seed ${seed}`, () => {
            const max = PosFns.new(Math.max(x1, x2), Math.max(y1, y2));
            const min = PosFns.new(Math.min(x1, x2), Math.min(y1, y2));

            const r = randomBetweenPosition({ max, min }, seedrandom(seed));

            expect(r.x).to.be.gte(min.x);
            expect(r.x).to.be.lte(max.x);

            expect(r.y).to.be.gte(min.y);
            expect(r.y).to.be.lte(max.y);
          });
        }
      )
    );
  });
});
