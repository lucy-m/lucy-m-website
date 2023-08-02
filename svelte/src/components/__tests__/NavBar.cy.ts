import type { ComponentProps } from "svelte";
import NavBar from "../NavBar.svelte";

const renderComponent = (overrides?: {
  containerWidth?: string;
  props?: Partial<ComponentProps<NavBar>>;
}) => {
  const navigateSpy = cy.spy().as("navigateSpy");

  const props: ComponentProps<NavBar> = {
    navItems: ["a", "b", "c", "def", "foo"].map((s) => ({
      label: s,
      route: "/" + s,
    })),
    navigateFn: navigateSpy,
    ...overrides?.props,
  };

  cy.mountWithFixture(NavBar, props, { width: overrides?.containerWidth });
};

describe("NavBar", () => {
  const getMenuButton = () => cy.contains("button", "Menu");
  const getNonMenuButtons = () =>
    cy.get("button").filter(":not(:contains(Menu))");

  const assertNonMenuButtonsVisible = (visible: boolean) =>
    getNonMenuButtons().each((el) =>
      cy.wrap(el).should(visible ? "be.visible" : "not.be.visible")
    );

  describe("default state", () => {
    beforeEach(() => {
      renderComponent({ containerWidth: "400px" });
    });

    it("shows only menu button", () => {
      getMenuButton().should("be.visible");
      assertNonMenuButtonsVisible(false);
    });

    describe("click menu button", () => {
      beforeEach(() => {
        getMenuButton().click();
      });

      it("shows buttons", () => {
        getMenuButton().should("be.visible");
        assertNonMenuButtonsVisible(true);
      });

      describe("clicking a non menu button", () => {
        beforeEach(() => {
          cy.contains("button", "def").click();
        });

        it("calls navigate", () => {
          cy.get("@navigateSpy")
            .should("have.been.calledOnce")
            .should("have.been.calledWith", "/def");
        });

        it("closes menu", () => {
          getMenuButton().should("be.visible");
          assertNonMenuButtonsVisible(false);
        });
      });

      describe("clicking menu again", () => {
        beforeEach(() => {
          getMenuButton().click();
        });

        it("hides non menu buttons", () => {
          getMenuButton().should("be.visible");
          assertNonMenuButtonsVisible(false);
        });
      });
    });
  });

  describe("wide container", () => {
    beforeEach(() => {
      renderComponent({ containerWidth: "600px" });
    });

    it("renders correct height", () => {
      cy.get(".buttons-wrapper").should("not.have.attr", "style");
    });

    it("does not show menu button", () => {
      getMenuButton().should("not.be.visible");
    });

    it("displays all buttons in line", () => {
      assertNonMenuButtonsVisible(true);
      getNonMenuButtons().then((buttons) => {
        const firstButton = buttons[0];
        const firstTop = firstButton.getBoundingClientRect().top;

        for (const button of buttons) {
          expect(button.getBoundingClientRect().top).to.eq(firstTop);
        }
      });
    });
  });

  describe("changing viewport size", () => {
    beforeEach(() => {
      renderComponent({ containerWidth: "100%" });
    });

    it("narrow > wide > narrow, menu does not stay open", () => {
      cy.viewport(500, 500);
      assertNonMenuButtonsVisible(false);
      getMenuButton().click();
      assertNonMenuButtonsVisible(true);

      cy.viewport(800, 500);
      getMenuButton().should("not.be.visible");
      assertNonMenuButtonsVisible(true);

      cy.viewport(500, 500);
      assertNonMenuButtonsVisible(false);
    });
  });
});
