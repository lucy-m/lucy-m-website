import { Subject } from "rxjs";
import { makeCruisingBird } from "../cruising-bird";
import ObjectFixture from "./ObjectFixture.svelte";

describe("cruising bird", () => {
  beforeEach(() => {
    cy.viewport(1200, 800);
  });

  it.only("works", () => {
    const debugDrawSub: Subject<(ctx: CanvasRenderingContext2D) => void> =
      new Subject();

    cy.mount(ObjectFixture, {
      props: {
        makeObject: (seed) => makeCruisingBird("bird", 10, [100, 400], seed),
        seed: "abcd",
        onSceneChange: (scene) => {
          const feather = scene.objects[0];

          if (feather) {
            debugDrawSub.next((ctx) => {
              ctx.fillStyle = "mediumaquamarine";
              ctx.fillRect(
                feather.getPosition().x,
                feather.getPosition().y,
                6,
                6
              );
            });
          }
        },
        debugDraw$: debugDrawSub,
      },
    });
  });
});
