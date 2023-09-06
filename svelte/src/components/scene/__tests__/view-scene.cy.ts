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

        tick(100);
      });

      it("changes scene", () => {
        expect(currentScene.typeName).to.eq("house-scene");
      });

      it("stops bird spawning", () => {
        tick(120_000).then(() => {
          expect(
            currentScene.objects.find((o) => o.typeName === "cruising-bird")
          ).to.be.undefined;
        });
      });
    });
  });
});
