import {
  PosFns,
  loadImages,
  type AssetKey,
  type DrawLayer,
} from "../../../model";
import CanvasDrawFixture from "./CanvasDrawFixture.svelte";

describe("canvas-draw", () => {
  describe("images", () => {
    let images: Record<AssetKey, HTMLImageElement>;

    beforeEach(async () => {
      images = await loadImages();
    });

    interface TestCase {
      caseName: string;
      drawLayers: (Omit<DrawLayer, "content"> & { assetKey: AssetKey })[];
      only?: true;
    }

    const testCases: TestCase[] = [
      {
        caseName: "small house",
        drawLayers: [
          {
            assetKey: "houseSmall",
            position: PosFns.new(10, 20),
          },
        ],
      },
      {
        caseName: "bird flap up",
        drawLayers: [
          {
            assetKey: "birdFlapUp",
            position: PosFns.new(100, 50),
          },
        ],
      },
      {
        caseName: "feathers",
        drawLayers: Array.from({ length: 16 }).map((_, i) => {
          const x = 20 + (i % 4) * 100;
          const y = 20 + Math.floor(i / 4) * 100;
          const rotation = i * 25 - 100;

          return {
            assetKey: "feather1",
            position: PosFns.new(x, y),
            rotation,
          };
        }),
      },
    ];

    testCases.forEach((testCase) => {
      (testCase.only ? it.only : it)("" + testCase.caseName, () => {
        cy.mount(CanvasDrawFixture, {
          props: {
            drawLayers: testCase.drawLayers.map((drawLayer) => ({
              ...drawLayer,
              content: {
                kind: "image" as const,
                image: images[drawLayer.assetKey],
              },
            })),
          },
        });

        cy.get("canvas").should("have.attr", "data-initialised", "true");

        cy.percySnapshot();
      });
    });
  });
});
