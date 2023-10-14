import type { ComponentProps } from "svelte";
import { TalentsOverlay } from "..";
import { loadImages, type AssetKey } from "../../../../../model";

const mountComponent = (
  images: Record<AssetKey, ImageBitmap>,
  overrides?: {
    props?: Partial<ComponentProps<TalentsOverlay>>;
  }
) => {
  cy.mount(TalentsOverlay, {
    props: {
      images,
      learned: [],
      totalTalentPoints: 3,
      onClosed: cy.spy().as("onClosed"),
      unmountSelf: cy.spy().as("unmountSelf"),
      ...overrides?.props,
    },
  });
};

describe("TalentsOverlay", () => {
  let images: Record<AssetKey, ImageBitmap>;

  const getTalentViewer = () => cy.getByTestId("talent-viewer");
  const getTalentSquares = () => cy.get("canvas");

  beforeEach(() => {
    cy.viewport(800, 600);
  });

  beforeEach((done) => {
    loadImages().then((i) => {
      images = i;
      done();
    });
  });

  describe("no learned talents", () => {
    beforeEach(() => {
      mountComponent(images);
    });

    it("displays all talents correctly", () => {
      getTalentSquares().should("have.length", 4);
      cy.contains("0/3 points spent");
      cy.percySnapshot();
    });

    it("does not display talent viewer", () => {
      getTalentViewer().should("not.exist");
    });

    describe("selecting the first talent", () => {
      beforeEach(() => {
        getTalentSquares().eq(0).click();
      });

      it("displays talents correctly", () => {
        cy.percySnapshot();
      });

      it("displays correct item in talent viewer panel", () => {
        getTalentViewer().should("contain.text", "Learning the ropes");
      });

      describe("selecting another item", () => {
        beforeEach(() => {
          getTalentSquares().eq(1).click();
        });

        it("displays correct item in talent viewer panel", () => {
          getTalentViewer().should("contain.text", "Incredible multitasking");
        });
      });

      describe("clicking learn", () => {
        beforeEach(() => {
          cy.contains("button", "Learn").click();
        });

        it("displays correctly", () => {
          // Wait for transition
          cy.wait(1500);
          cy.percySnapshot();
        });

        it("shows correct points spent", () => {
          cy.contains("1/3 points spent");
        });

        describe("clicking close", () => {
          beforeEach(() => {
            cy.contains("button", "Close").click();
          });

          it("calls event handlers correctly", () => {
            cy.get("@onClosed").should("have.been.calledOnceWith", [
              "proficiency",
            ]);
            cy.get("@unmountSelf").should("have.been.calledOnce");
          });
        });
      });
    });
  });

  describe("initially learned talents", () => {
    beforeEach(() => {
      mountComponent(images, {
        props: {
          learned: ["proficiency", "idle"],
          totalTalentPoints: 2,
        },
      });
    });

    it("matches snapshot", () => {
      cy.percySnapshot();
    });

    describe("selecting first talent", () => {
      beforeEach(() => {
        getTalentSquares().eq(0).click();
      });

      it("does not have learn button", () => {
        cy.contains("button", "Learn").should("not.exist");
      });
    });

    describe("selecting unlearned talent", () => {
      beforeEach(() => {
        getTalentSquares().eq(2).click();
      });

      it("learn button is disabled", () => {
        cy.contains("button", "Learn").should("be.disabled");
      });
    });
  });
});
