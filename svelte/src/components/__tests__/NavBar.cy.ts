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

  describe("default state", () => {
    beforeEach(() => {
      renderComponent({ containerWidth: "400px" });
    });

    it("shows only menu button", () => {
      getMenuButton().should("be.visible");
      getNonMenuButtons().each((el) => cy.wrap(el).should("not.be.visible"));
    });

    describe("click menu button", () => {
      beforeEach(() => {
        getMenuButton().click();
      });

      it("shows buttons", () => {
        getMenuButton().should("be.visible");
        getNonMenuButtons().each((el) => cy.wrap(el).should("be.visible"));
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
          getNonMenuButtons().each((el) =>
            cy.wrap(el).should("not.be.visible")
          );
        });
      });

      describe("clicking menu again", () => {
        beforeEach(() => {
          getMenuButton().click();
        });

        it("hides non menu buttons", () => {
          getMenuButton().should("be.visible");
          getNonMenuButtons().each((el) =>
            cy.wrap(el).should("not.be.visible")
          );
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
      getNonMenuButtons().each((el) => cy.wrap(el).should("be.visible"));
      getNonMenuButtons().then((buttons) => {
        const firstButton = buttons[0];
        const firstTop = firstButton.getBoundingClientRect().top;

        for (const button of buttons) {
          expect(button.getBoundingClientRect().top).to.eq(firstTop);
        }
      });
    });
  });
});
