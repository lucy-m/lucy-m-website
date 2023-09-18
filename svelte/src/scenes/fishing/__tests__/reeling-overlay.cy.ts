import { Subject } from "rxjs";
import type { Position, SceneObject, SceneType } from "../../../model";
import { reelingOverlay } from "../objects/reeling-overlay";

const interactive = Cypress.config("isInteractive");
// const interactive = false;

describe("reeling-overlay", () => {
  let lastScene: SceneType;
  let worldClickSub: Subject<Position>;

  const getSpinner = (): SceneObject => {
    const value = lastScene
      .getObjects()
      .find((obj) => obj.typeName === "reeling-overlay");

    expect(value).to.exist;
    return value!;
  };

  const clickSpinner = () => {
    worldClickSub.next(getSpinner().getPosition());
  };

  const getSpinnerRotation = (): {
    rotation: number;
    rotationSpeed: number;
  } => {
    const reel = getSpinner();
    expect(reel?._getDebugInfo).to.exist;
    const debugInfo = reel!._getDebugInfo!();
    const rotation = debugInfo?.rotation;
    const rotationSpeed = debugInfo?.rotationSpeed;

    return { rotation, rotationSpeed };
  };

  beforeEach(() => {
    cy.viewport(1400, 900);

    if (!interactive) {
      cy.clock();
    }

    worldClickSub = new Subject();

    cy.mountSceneObject({
      makeObjects: (random) => [
        reelingOverlay({ random, onComplete: cy.spy().as("onCompleteSpy") }),
      ],
      seed: "any",
      onSceneChange: (scene) => {
        lastScene = scene;
      },
      worldClick$: worldClickSub,
    });
  });

  it("flies in from top", () => {
    const initialPosition = getSpinner().getPosition();

    cy.interactiveWait(1_000, interactive).then(() => {
      const newPosition = getSpinner().getPosition();
      expect(newPosition.x).to.eq(initialPosition.x);
      expect(newPosition.x).to.be.greaterThan(initialPosition.y);
    });
  });

  it("spinner is spinning", () => {
    const initialRotation = getSpinnerRotation();

    cy.interactiveWait(1_000, interactive).then(() => {
      const newRotation = getSpinnerRotation();
      expect(newRotation.rotation).to.be.greaterThan(initialRotation.rotation);
    });
  });

  it("clicking the reeling overlay increases speed", () => {
    const initialRotation = getSpinnerRotation();

    clickSpinner();
    cy.interactiveWait(100, interactive).then(() => {
      const newRotation = getSpinnerRotation();
      expect(newRotation.rotationSpeed).to.be.greaterThan(
        initialRotation.rotationSpeed
      );
    });
  });

  it("reel decelerates to min speed", () => {
    Array.from({ length: 5 }).forEach(() => {
      clickSpinner();
    });

    cy.interactiveWait(100, interactive).then(() => {
      const firstRotation = getSpinnerRotation();

      cy.interactiveWait(1_000, interactive).then(() => {
        const secondRotation = getSpinnerRotation();

        expect(secondRotation.rotationSpeed).to.be.lessThan(
          firstRotation.rotationSpeed
        );
      });
    });

    cy.interactiveWait(3_000, interactive).then(() => {
      const laterRotation = getSpinnerRotation();
      expect(laterRotation.rotationSpeed).to.eq(0.3);
    });
  });

  describe("completing the reel", () => {
    beforeEach(() => {
      cy.get("@onCompleteSpy").should("not.have.been.called");

      Array.from({ length: 32 }).forEach(() => {
        cy.interactiveWait(100, interactive).then(() => {
          clickSpinner();
        });
      });

      cy.interactiveWait(100, interactive).then(() => {
        const rotation = getSpinnerRotation();
        expect(rotation.rotation).to.be.greaterThan(360 * 4);
      });
    });

    it("calls onComplete", () => {
      cy.get("@onCompleteSpy").should("have.been.calledOnce");
    });

    it("disappears", () => {
      cy.interactiveWait(1_000, interactive).then(() => {
        expect(lastScene.getObjects()).to.have.length(0);
      });
    });
  });
});
