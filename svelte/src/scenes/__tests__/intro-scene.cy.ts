import seedrandom from "seedrandom";
import { validate } from "uuid";
import type { SceneAction, SceneObject, SceneType } from "../../model";
import { makeIntroScene } from "../intro-scene";

const assertObjectsMatch = (
  objectA: SceneObject<string, unknown>,
  objectB: SceneObject<string, unknown>
) => {
  expect(objectA.getLayers(objectA)).to.deep.equal(objectB.getLayers(objectB));

  for (const key in objectA) {
    const valueA = (objectA as Record<string, unknown>)[key];

    if (typeof valueA === "function") {
      continue;
    } else {
      const valueB = (objectB as Record<string, unknown>)[key];
      expect(valueA).to.deep.equal(valueB);
    }
  }
};

describe("intro scene", () => {
  it("all IDs are valid", () => {
    const scene = makeIntroScene(seedrandom());

    for (const object of scene.objects) {
      expect(validate(object.id)).to.be.true;
    }
  });

  describe("scenes with same seeds", () => {
    let sceneA: SceneType<string>;
    let sceneB: SceneType<string>;

    const seed = "the best seed in the world";

    beforeEach(() => {
      sceneA = makeIntroScene(seedrandom(seed));
      sceneB = makeIntroScene(seedrandom(seed));

      cy.clock();
    });

    it("produces same objects", () => {
      for (const index in sceneA.objects) {
        const objectA = sceneA.objects[index];
        const objectB = sceneB.objects[index];

        assertObjectsMatch(objectA, objectB);
      }
    });

    describe("ticking", () => {
      let actionsA: SceneAction<string>[];
      let actionsB: SceneAction<string>[];

      beforeEach(() => {
        actionsA = [];
        actionsB = [];

        sceneA.actions.subscribe((value) => {
          actionsA.push(value);
        });

        sceneB.actions.subscribe((value) => {
          actionsB.push(value);
        });
      });

      describe("20 seconds", () => {
        beforeEach(() => {
          cy.tick(20_000);
          cy.wrap(actionsA).should("not.have.length", 0);
          cy.wrap(actionsB).should("not.have.length", 0);
        });

        it("produces same actions", () => {
          for (const index in actionsA) {
            const actionA = actionsA[index];
            const actionB = actionsB[index];

            expect(actionA.kind).to.equal(actionB.kind);
            expect(actionA.kind).to.equal("addObject");

            const objectA = actionA.makeObject();
            const objectB = actionB.makeObject();

            assertObjectsMatch(objectA, objectB);
          }
        });
      });
    });
  });
});
