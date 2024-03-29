import type { PRNG } from "seedrandom";
import { OscillatorFns, type Oscillator } from "../oscillator";
import { PosFns } from "../position";
import { makeSceneObject } from "../scene-object";
import type { SceneObject, SceneType } from "../scene-types";

describe("oscillator", () => {
  // const interactive = Cypress.config("isInteractive");
  const interactive = false;

  beforeEach(() => {
    if (!interactive) {
      cy.clock();
    }
  });

  it("works", () => {
    const makeOscillatorSceneObject = (args: {
      random: PRNG;
      overrides?: Partial<Oscillator>;
    }): SceneObject => {
      let yPosition = 50;

      let oscillator = OscillatorFns.make({
        amplitude: 200,
        initial: 300,
        period: 100,
        time: 0,
        ...args.overrides,
      });

      return makeSceneObject(args.random)({
        getPosition: () => PosFns.new(oscillator.position, yPosition),
        getLayers: () => [
          {
            kind: "image",
            assetKey: "feather1",
          },
        ],
        layerKey: "test",
        onTick: () => {
          yPosition += 2;
          oscillator = OscillatorFns.tick(oscillator, 1);
        },
      });
    };

    cy.mountSceneObject({
      makeObjects: (random: PRNG) => [
        makeOscillatorSceneObject({ random }),
        makeOscillatorSceneObject({
          random,
          overrides: { time: 25, initial: 700, amplitude: 50 },
        }),
        makeOscillatorSceneObject({
          random,
          overrides: { period: 40, initial: 1000, amplitude: 100 },
        }),
        makeOscillatorSceneObject({
          random,
          overrides: { period: 400, initial: 1400, amplitude: 50 },
        }),
      ],
      seed: "fry",
      debugTrace: {
        sources: (scene: SceneType) => scene.getObjects(),
        colour: ({ index }: { index: number }) =>
          `hsl(${index * 60}, 80%, 60%)`,
      },
    });

    cy.interactiveWait(15_000, interactive);

    cy.percySnapshot();
  });
});
