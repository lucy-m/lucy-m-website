import fc from "fast-check";
import { Subject } from "rxjs";
import seedrandom from "seedrandom";
import { validate } from "uuid";
import type { SceneEventOrAction, SceneObject, SceneType } from "../../model";
import { PosFns, type Position } from "../../model";
import { makeIntroScene } from "../intro-scene";
import ViewSceneFixture from "./ViewSceneFixture.svelte";

describe("intro scene", () => {
  describe("scenes with same seed", () => {
    fc.assert(
      fc.property(fc.string(), (seed) => {
        describe("seed = " + seed, () => {
          let sceneA: SceneType;
          let sceneB: SceneType;

          beforeEach(() => {
            sceneA = makeIntroScene(seedrandom(seed));
            sceneB = makeIntroScene(seedrandom(seed));

            cy.clock();
          });

          it("all IDs are valid", () => {
            for (const object of sceneA.getObjects()) {
              expect(validate(object.id)).to.be.true;
            }
          });

          it("produces same objects", () => {
            for (const index in sceneA.getObjects()) {
              const objectA = sceneA.getObjects()[index];
              const objectB = sceneB.getObjects()[index];

              cy.assertObjectsMatch(objectA, objectB);
            }
          });

          describe("ticking", () => {
            let actionsA: SceneEventOrAction[];
            let actionsB: SceneEventOrAction[];

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
                      SceneEventOrAction,
                      { kind: "addObject" }
                    >
                  ).makeObject();
                  const objectB = (
                    actionB as Extract<
                      SceneEventOrAction,
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

  describe("rendering tests", () => {
    const findByTypeName = (
      scene: SceneType,
      typeName: string
    ): SceneObject | undefined => {
      return scene.getObjects().find((obj) => obj.typeName === typeName);
    };

    const getByTypeName = (scene: SceneType, typeName: string): SceneObject => {
      const obj = findByTypeName(scene, typeName);

      if (!obj) {
        throw new Error(`Cannot find object with typeName ${typeName}`);
      }

      return obj;
    };

    beforeEach(() => {
      cy.viewport(1400, 900);
      cy.clock();
    });

    describe("intro-scene", () => {
      let currentScene: SceneType;
      let worldClick$: Subject<Position>;

      beforeEach(() => {
        worldClick$ = new Subject<Position>();

        cy.mount(ViewSceneFixture, {
          props: {
            makeScene: makeIntroScene,
            seed: "abcd",
            onSceneChange: (s: SceneType) => {
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
          const house = getByTypeName(currentScene, "small-house");
          worldClick$.next(PosFns.add(house.getPosition(), PosFns.new(5, 5)));

          cy.steppedTick(100);
        });

        it("changes scene", () => {
          expect(currentScene.typeName).to.eq("house-scene");
        });

        it("stops bird spawning", () => {
          cy.steppedTick(120_000).then(() => {
            expect(
              currentScene
                .getObjects()
                .find((o) => o.typeName === "cruising-bird")
            ).to.be.undefined;
          });
        });
      });

      describe("clicking speech bubble", () => {
        beforeEach(() => {
          const speechBubble = getByTypeName(currentScene, "speech-bubble");

          worldClick$.next(
            PosFns.add(speechBubble.getPosition(), PosFns.new(5, 5))
          );

          cy.steppedTick(100);
        });

        it("disappears", () => {
          const speechBubble = findByTypeName(currentScene, "speech-bubble");
          expect(speechBubble).not.to.exist;
        });

        describe("clicking person", () => {
          beforeEach(() => {
            const person = getByTypeName(currentScene, "person");

            worldClick$.next(
              PosFns.add(person.getPosition(), PosFns.new(5, 5))
            );

            cy.steppedTick(100);
          });

          it("shows speech bubble", () => {
            const speechBubble = findByTypeName(currentScene, "speech-bubble");
            expect(speechBubble).to.exist;
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

              cy.mount(ViewSceneFixture, {
                props: {
                  makeScene: makeIntroScene,
                  seed,
                  onSceneChange: (scene) => {
                    scene
                      .getObjects()
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
});
