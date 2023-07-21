import type { ComponentProps } from "svelte";
import ImagesAndText from "../ImagesAndText.svelte";

const finnyImg = { src: "/finny.jpeg", alt: "Girl with a pink teddy" };
const prettyGirlImg = { src: "/pretty-girl.jpeg", alt: "Pretty girl" };
const svalbardImg = {
  src: "/svalbard.jpeg",
  alt: "Girl standing in front of pack ice",
};

const renderComponent = (overrides?: {
  props?: Partial<ComponentProps<ImagesAndText>>;
}) => {
  const props: ComponentProps<ImagesAndText> = {
    images: [finnyImg, prettyGirlImg, svalbardImg],
    text: ["Hello", "Lorem ipsum dolor sit amet"],
    ...overrides?.props,
  };

  cy.mount(ImagesAndText, { props });
};

describe("ImagesAndText", () => {
  const clickVisible = () => {
    cy.get("img[data-current='true']").should("have.length", 1).click();
  };

  describe("default", () => {
    beforeEach(() => {
      renderComponent();
    });

    const assertIndexVisible = (index: 0 | 1 | 2): void => {
      [0, 1, 2].forEach((i) => {
        cy.get("img")
          .eq(i)
          .should("have.attr", "data-current", i === index ? "true" : "false");
      });
    };

    const assertImageInLocation = (index: 0 | 1 | 2, top: string): void => {
      cy.getByTestId("images-and-text").within(() => {
        cy.get("img")
          .eq(index)
          .invoke("attr", "style")
          .should("contain", `top: ${top}`);
      });
    };

    it("renders all images", () => {
      cy.get("img").should("have.length", 3);
      cy.get("img")
        .eq(0)
        .should("have.attr", "src", finnyImg.src)
        .should("have.attr", "alt", finnyImg.alt);
      cy.get("img")
        .eq(1)
        .should("have.attr", "src", prettyGirlImg.src)
        .should("have.attr", "alt", prettyGirlImg.alt);
      cy.get("img")
        .eq(2)
        .should("have.attr", "src", svalbardImg.src)
        .should("have.attr", "alt", svalbardImg.alt);
    });

    it("only first image is visible", () => {
      assertIndexVisible(0);
    });

    it("images are in correct position", () => {
      assertImageInLocation(0, "4%");
      assertImageInLocation(1, "100%");
      assertImageInLocation(2, "100%");
    });

    describe("clicking", () => {
      beforeEach(() => {
        clickVisible();
      });

      it("shows second image", () => {
        assertIndexVisible(1);
      });

      it("images are in correct position", () => {
        assertImageInLocation(0, "2%");
        assertImageInLocation(1, "6%");
        assertImageInLocation(2, "100%");
      });

      describe("clicking (second time)", () => {
        beforeEach(() => {
          clickVisible();
        });

        it("shows thirdimage", () => {
          assertIndexVisible(2);
        });

        it("images are in correct position", () => {
          assertImageInLocation(0, "0%");
          assertImageInLocation(1, "4%");
          assertImageInLocation(2, "8%");
        });

        describe("clicking (third time)", () => {
          beforeEach(() => {
            clickVisible();
          });

          it("shows first image", () => {
            assertIndexVisible(0);
          });

          it("images are in correct position", () => {
            assertImageInLocation(0, "4%");
            assertImageInLocation(1, "100%");
            assertImageInLocation(2, "100%");
          });
        });
      });
    });
  });
});
