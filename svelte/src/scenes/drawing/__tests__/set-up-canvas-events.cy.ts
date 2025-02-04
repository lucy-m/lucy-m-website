import { PosFns, type Position } from "../../../model";
import type { UserInteraction } from "../../../model/user-interactions";
import { setUpCanvasEvents } from "../set-up-canvas-events";
import SetUpCanvasEventsFixture from "./SetUpCanvasEventsFixture.svelte";

describe("set up canvas events", () => {
  // scene size is 1/2 size of the real canvas
  const sceneSize: Position = {
    x: 300,
    y: 200,
  };

  let lastInteraction: UserInteraction | undefined;

  beforeEach(() => {
    lastInteraction = undefined;

    cy.viewport(640, 440);
    cy.mount(SetUpCanvasEventsFixture);

    cy.get("canvas").then(([canvas]) => {
      canvas.width = sceneSize.x;
      canvas.height = sceneSize.y;

      setUpCanvasEvents(canvas).subscribe((e) => {
        lastInteraction = e;
      });
    });
  });

  describe("click in centre", () => {
    type TestCase = {
      canvasLocation: Position;
      expectedLocation: Position;
    };

    const testCases: TestCase[] = [
      {
        canvasLocation: { x: 0, y: 0 },
        expectedLocation: { x: 0, y: 0 },
      },
      {
        canvasLocation: { x: 40, y: 0 },
        expectedLocation: { x: 20, y: 0 },
      },
      {
        canvasLocation: { x: 0, y: 30 },
        expectedLocation: { x: 0, y: 15 },
      },
      {
        canvasLocation: { x: 150, y: 120 },
        expectedLocation: { x: 75, y: 60 },
      },
    ];

    testCases.forEach((testCase) => {
      it(`click at ${PosFns.toString(
        testCase.canvasLocation
      )} raises event at ${PosFns.toString(testCase.expectedLocation)}`, () => {
        cy.get("canvas")
          .click(testCase.canvasLocation.x, testCase.canvasLocation.y)
          .then(() => {
            const expected: UserInteraction = {
              kind: "click",
              position: testCase.expectedLocation,
            };

            expect(lastInteraction).to.deep.eq(expected);
          });
      });
    });
  });

  it("pointermove", () => {
    cy.get("canvas")
      .trigger("pointermove", { offsetX: 20, offsetY: 40 })
      .then(() => {
        const expected: UserInteraction = {
          kind: "pointermove",
          position: { x: 10, y: 20 },
        };

        expect(lastInteraction).to.deep.eq(expected);
      });
  });

  it("pointerdown", () => {
    cy.get("canvas")
      .trigger("pointerdown")
      .then(() => {
        const expected: UserInteraction = {
          kind: "pointerdown",
        };

        expect(lastInteraction).to.deep.eq(expected);
      });
  });

  it("pointerup", () => {
    cy.get("canvas")
      .trigger("pointerup")
      .then(() => {
        const expected: UserInteraction = {
          kind: "pointerup",
        };

        expect(lastInteraction).to.deep.eq(expected);
      });
  });
});
