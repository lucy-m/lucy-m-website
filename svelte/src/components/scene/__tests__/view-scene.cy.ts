import { Subject } from "rxjs";
import { PosFns, type Position, type SceneType } from "../../../model";
import { makeIntroScene } from "../../../scenes";
import Fixture from "./Fixture.svelte";

describe("view-scene", () => {
  const tick = (by: number) => {
    cy.log(`Tick ${by}`);

    const dt = 30;
    Array.from({ length: by / dt - 1 }).forEach(() => {
      cy.tick(dt, { log: false });
    });

    return cy.tick(dt, { log: false });
  };

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
          onSceneChange: (s) => {
            currentScene = s;
          },
          worldClick$,
        },
      });
      cy.get("canvas").should("have.attr", "data-initialised", "true");
    });

    it("works", () => {});

    describe("clicking house", () => {
      beforeEach(() => {
        expect(currentScene).to.exist;
        console.log(currentScene);

        // Update to use internal names
        const house = currentScene.objects.find(
          (obj) => obj.id === "0fd9579d-29fb-4c83-9e76-06199ce12bed"
        )!;
        expect(house).to.exist;

        worldClick$.next(PosFns.add(house.position, PosFns.new(5, 5)));

        tick(100);
      });

      it.only("changes scene", () => {
        // Update to use internal names
        expect(currentScene.objects).to.have.length(1);
      });

      it("stops bird spawning", () => {
        tick(120_000).then(() => {
          // Update to use internal names
          expect(currentScene.objects).to.have.length(1);
        });
      });
    });

    it("clicking bird", () => {
      tick(4_000).then(() => {
        // Update to use internal names
        const bird = currentScene.objects.find(
          (obj) => obj.layerKey === "bird"
        );
        expect(bird).to.exist;
        worldClick$.next({ x: bird!.position.x + 5, y: bird!.position.y + 5 });
      });
      tick(400);

      // Need some assertions
    });
  });
});
