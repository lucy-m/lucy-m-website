import fc from "fast-check";
import { Subject } from "rxjs";
import seedrandom from "seedrandom";
import { validate } from "uuid";
import {
  PosFns,
  type Position,
  type SceneEventOrAction,
  type SceneType,
} from "../../model";
import { makeIntroScene } from "../intro-scene";
import ViewSceneFixture from "./ViewSceneFixture.svelte";

describe("intro scene", () => {
  describe("scenes with same seed", () => {
    fc.assert(
      fc.property(fc.string(), (seed) => {
        describe("seed = " + seed, () => {
          let sceneA: SceneType<string>;
          let sceneB: SceneType<string>;

          beforeEach(() => {
            sceneA = makeIntroScene(seedrandom(seed));
            sceneB = makeIntroScene(seedrandom(seed));

            cy.clock();
          });

          it("all IDs are valid", () => {
            for (const object of sceneA.objects) {
              expect(validate(object.id)).to.be.true;
            }
          });

          it("produces same objects", () => {
            for (const index in sceneA.objects) {
              const objectA = sceneA.objects[index];
              const objectB = sceneB.objects[index];

              cy.assertObjectsMatch(objectA, objectB);
            }
          });

          describe("ticking", () => {
            let actionsA: SceneEventOrAction<string>[];
            let actionsB: SceneEventOrAction<string>[];

            beforeEach(() => {
              actionsA = [];
              actionsB = [];

              sceneA.events.subscribe((value) => {
                actionsA.push(value);
              });

              sceneB.events.subscribe((value) => {
                actionsB.push(value);
              });
            });

            describe("20 seconds in 100ms increments", () => {
              beforeEach(() => {
                Array.from({ length: 200 }).forEach(() => {
                  cy.tick(100, { log: false });
                });
                cy.wrap(actionsA).should("not.have.length", 0);
                cy.wrap(actionsB).should("not.have.length", 0);
              });

              it("produces same actions", () => {
                for (const index in actionsA) {
                  const actionA = actionsA[index];
                  const actionB = actionsB[index];

                  expect(actionA.kind).to.equal(actionB.kind);
                  expect(actionA.kind).to.equal("addObject");

                  const objectA = (
                    actionA as Extract<
                      SceneEventOrAction<string>,
                      { kind: "addObject" }
                    >
                  ).makeObject();
                  const objectB = (
                    actionB as Extract<
                      SceneEventOrAction<string>,
                      { kind: "addObject" }
                    >
                  ).makeObject();

                  cy.assertObjectsMatch(objectA, objectB);
                }
              });
            });
          });
        });
      }),
      { numRuns: 20 }
    );
  });

  describe("rendering", () => {
    beforeEach(() => {
      cy.viewport(1400, 900);
      cy.clock();
    });

    let currentScene: SceneType<string>;
    let worldClick$: Subject<Position>;

    beforeEach(() => {
      worldClick$ = new Subject<Position>();

      cy.mount(ViewSceneFixture, {
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

    it("loads intro scene", () => {
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
      beforeEach(() => {
        cy.viewport(1400, 900);
        cy.clock();
      });

      fc.assert(
        fc.property(fc.string(), (seed) => {
          it("seed " + seed, () => {
            const allBirdIds = new Set<string>();

            cy.mount(ViewSceneFixture, {
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
