import type { ComponentProps } from "svelte";
import NavBar from "../NavBar.svelte";

const renderComponent = (overrides?: {
  containerWidth?: string;
  props?: Partial<ComponentProps<NavBar>>;
}) => {
  const navigateSpy = cy.spy().as("navigate");

  const props: ComponentProps<NavBar> = {
    navItems: [{ label: "A", route: "/" }],
    navigateFn: () => navigateSpy,
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
      getNonMenuButtons().should("not.be.visible");
    });
  });

  describe("wide container", () => {
    beforeEach(() => {
      renderComponent({ containerWidth: "600px" });
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
