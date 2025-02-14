import fc from "fast-check";
import { Subject } from "rxjs";
import seedrandom from "seedrandom";
import { validate } from "uuid";
import type { SceneObject, SceneType } from "../../model";
import { PosFns, type Position } from "../../model";
import { makeIntroScene } from "../intro-scene";

describe("intro scene", () => {
  describe("scenes with same seed", () => {
    fc.assert(
      fc.property(fc.string(), (seed) => {
        describe("seed = " + seed, () => {
          let sceneA: SceneType;
          let sceneB: SceneType;

          beforeEach(() => {
            sceneA = makeIntroScene({
              random: seedrandom(seed),
              mountSvelteComponent: () => {
                throw new Error("Not implemented");
              },
            })({}, () => {});
            sceneB = makeIntroScene({
              random: seedrandom(seed),
              mountSvelteComponent: () => {
                throw new Error("Not implemented");
              },
            })({}, () => {});
          });

          afterEach(() => {
            sceneA.destroy();
            sceneB.destroy();
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
            describe("100 ticks", () => {
              beforeEach(() => {
                Array.from({ length: 100 }).forEach(() => {
                  sceneA.onExternalEvent({ kind: "tick" });
                  sceneB.onExternalEvent({ kind: "tick" });
                });
              });

              it("objects match", () => {
                for (const index in sceneA.getObjects()) {
                  const objectA = sceneA.getObjects()[index];
                  const objectB = sceneB.getObjects()[index];

                  cy.assertObjectsMatch(objectA, objectB);
                }
              });
            });
          });
        });
      }),
      { numRuns: 1 }
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

        cy.mountViewScene({
          sceneSpec: makeIntroScene,
          seed: "abcd",
          onSceneChange: (s: SceneType) => {
            currentScene = s;
          },
          worldClick$,
        });
      });

      it("loads intro scene", () => {
        expect(currentScene.typeName).to.eq("intro-scene");
      });

      describe("clicking house", () => {
        beforeEach(() => {
          const house = getByTypeName(currentScene, "small-house");
          worldClick$.next(PosFns.add(house.getPosition(), PosFns.new(5, 5)));

          cy.steppedTick(1000);
        });

        it.only("changes scene", () => {
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

              cy.mountViewScene({
                sceneSpec: makeIntroScene,
                seed,
                onSceneChange: (scene: SceneType) => {
                  scene
                    .getObjects()
                    .filter((obj) => obj.typeName === "cruising-bird")
                    .forEach((bird) => allBirdIds.add(bird.id));
                },
              });

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
