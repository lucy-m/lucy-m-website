import { PosFns, makeSceneObject, type Position } from "../../../model";
import { sceneSize } from "../../scene-size";
import { castOutMan } from "../fisherman";

const interactive = Cypress.config("isInteractive");
// const interactive = false;

describe("fisherman", () => {
  beforeEach(() => {
    cy.viewport(1400, 1000);

    if (!interactive) {
      cy.clock();
    }
  });

  it("works", () => {
    let bobberState:
      | {
          position: Position;
          stationary: boolean;
        }
      | undefined;

    cy.mountSceneObject({
      makeObjects: (random) => [
        makeSceneObject(random)({
          layerKey: "background",
          getPosition: () => PosFns.zero,
          getLayers: () => [
            {
              kind: "image",
              assetKey: "fishingBackground",
              subLayer: "background",
            },
          ],
        }),
        castOutMan(random),
      ],
      layerOrder: ["background", "man", "bobber"],
      seed: "some-seed",
      onSceneChange: (scene) => {
        bobberState = undefined;

        const bobber = scene
          .getObjects()
          .find((obj) => obj.typeName === "bobber");
        if (bobber && bobber._getDebugInfo) {
          const position = bobber.getPosition();
          const stationary = bobber._getDebugInfo().stationary;

          if (typeof stationary === "boolean") {
            bobberState = { position, stationary };
          }
        }
      },
      debugTrace: {
        sources: (scene) =>
          scene.getObjects().filter((obj) => obj.typeName === "bobber"),
        colour: () => "mediumaquamarine",
      },
    });

    cy.interactiveWait(5_000, interactive).then(() => {
      expect(bobberState).to.exist;

      expect(bobberState?.stationary).to.be.true;
      expect(bobberState?.position.x).to.be.lessThan(sceneSize.x);
    });
  });
});
