import { Subject, Subscription } from "rxjs";
import { rafThrottle } from "../raf-throttle";

describe("rafThrottle", () => {
  let input: Subject<number>;
  let output: number[];
  let subscription: Subscription | undefined;
  let lastRafCallback: (() => void) | undefined;

  beforeEach(() => {
    input = new Subject<number>();
    output = [];

    cy.window()
      .then((win) => {
        cy.stub(win, "requestAnimationFrame")
          .as("rafStub")
          .callsFake((callback) => {
            lastRafCallback = callback;
          });
      })
      .then(() => {
        subscription = input.pipe(rafThrottle()).subscribe((v) => {
          output.push(v);
        });
      });
  });

  afterEach(() => {
    subscription?.unsubscribe();
  });

  describe("[1,2,3]", () => {
    beforeEach(() => {
      input.next(1);
      input.next(2);
      input.next(3);
    });

    it("calls raf once", () => {
      cy.get("@rafStub").should("have.callCount", 1);
    });

    describe("raf resolves", () => {
      beforeEach(() => {
        expect(lastRafCallback).to.exist;
        lastRafCallback!();
      });

      it("outputs first value", () => {
        cy.wrap(output).should("deep.equal", [1]);
      });

      describe("[4,5]", () => {
        beforeEach(() => {
          input.next(4);
          input.next(5);
        });

        it("calls raf again", () => {
          cy.get("@rafStub").should("have.callCount", 2);
        });

        describe("raf resolves", () => {
          beforeEach(() => {
            expect(lastRafCallback).to.exist;
            lastRafCallback!();
          });

          it("outputs second value", () => {
            cy.wrap(output).should("deep.equal", [1, 4]);
          });
        });
      });
    });
  });
});
