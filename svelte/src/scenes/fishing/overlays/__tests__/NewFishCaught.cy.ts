import { NewFishCaught } from "..";

describe("NewFishCaught", () => {
  describe("display", () => {
    interface TestCase {
      fishType: string;
      expected: {
        src: string;
        displayName: string;
      };
      only?: true;
    }

    const testCases: TestCase[] = [
      {
        fishType: "commonBrown",
        expected: {
          src: "/assets/scene-fishing/fish/1_brown_bg.jpg",
          displayName: "Common mudfish",
        },
      },
      {
        fishType: "commonGrey",
        expected: {
          src: "/assets/scene-fishing/fish/2_grey_bg.jpg",
          displayName: "Common bitterfish",
        },
      },
      {
        fishType: "commonBrownGrey",
        expected: {
          src: "/assets/scene-fishing/fish/3_brown_grey_bg.jpg",
          displayName: "Common shallow flowerfish",
        },
      },
      {
        fishType: "john the fish",
        expected: {
          src: "/assets/scene-fishing/fish/1_brown_bg.jpg",
          displayName: "Mysteryfish",
        },
      },
    ];

    testCases.forEach(({ fishType, expected, only }) => {
      (only ? describe.only : describe)("case " + fishType, () => {
        beforeEach(() => {
          cy.mountWithFixture(NewFishCaught, {
            unmountSelf: cy.spy().as("unmountSelfSpy"),
            fishType,
          });
        });

        it("has correct src", () => {
          cy.get("img").should("have.attr", "src", expected.src);
        });

        it("has correct display name", () => {
          cy.contains(expected.displayName);
        });
      });
    });

    it("works", () => {});
  });
});
