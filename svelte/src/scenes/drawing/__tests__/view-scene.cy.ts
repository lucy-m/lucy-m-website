import fc from "fast-check";
import { Subject } from "rxjs";
import { PosFns, type Position, type SceneType } from "../../../model";
import { makeIntroScene } from "../../../scenes";
import Fixture from "./ViewSceneFixture.svelte";

describe("view-scene", () => {
  beforeEach(() => {
    cy.viewport(1400, 900);
    cy.clock();
  });

  describe("intro-scene", () => {
    let currentScene: SceneType<string>;
    let worldClick$: Subject<Position>;

    beforeEach(() => {
      worldClick$ = new Subject<Position>();

      cy.mount(Fixture, {
        props: {
          makeScene: makeIntroScene,
          seed: "abcd",
          onSceneChange: (s: SceneType<string>) => {
            currentScene = s;
          },
          worldClick$,
        },
      });
      cy.get("canvas").should("have.attr", "data-initialised", "true");
    });

    it.only("loads intro scene", () => {
      expect(currentScene.typeName).to.eq("intro-scene");
    });

    describe("clicking house", () => {
      beforeEach(() => {
        expect(currentScene).to.exist;
        const house = currentScene.objects.find(
          (obj) => obj.typeName === "small-house"
        )!;
        expect(house).to.exist;

        worldClick$.next(PosFns.add(house.position, PosFns.new(5, 5)));

        cy.steppedTick(100);
      });

      it("changes scene", () => {
        expect(currentScene.typeName).to.eq("house-scene");
      });

      it("stops bird spawning", () => {
        cy.steppedTick(120_000).then(() => {
          expect(
            currentScene.objects.find((o) => o.typeName === "cruising-bird")
          ).to.be.undefined;
        });
      });
    });
  });

  describe("property-based", () => {
    describe("birds are spawned over two minutes", () => {
      fc.assert(
        fc.property(fc.string(), (seed) => {
          it("seed " + seed, () => {
            const allBirdIds = new Set<string>();

            cy.mount(Fixture, {
              props: {
                makeScene: makeIntroScene,
                seed,
                onSceneChange: (scene) => {
                  scene.objects
                    .filter((obj) => obj.typeName === "cruising-bird")
                    .forEach((bird) => allBirdIds.add(bird.id));
                },
              },
            });
            cy.get("canvas").should("have.attr", "data-initialised", "true");

            cy.steppedTick(120_000).then(() => {
              const expectedMax = 120_000 / 6_000;
              const expectedMin = 120_000 / 15_000;

              expect(allBirdIds).length.to.be.greaterThan(expectedMin);
              expect(allBirdIds).length.to.be.lessThan(expectedMax);
            });
          });
        }),
        { numRuns: 10 }
      );
    });
  });
});
