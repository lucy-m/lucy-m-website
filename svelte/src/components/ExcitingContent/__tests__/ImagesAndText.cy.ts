import type { ComponentProps } from "svelte";
import ImagesAndText from "../ImagesAndText.svelte";

const finnyImg = { src: "/finny.jpeg", alt: "Girl with a pink teddy" };
const prettyGirlImg = {
  src: "/pretty-girl.jpeg",
  alt: "Pretty girl with a nice hat",
};
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
    imageSize: 200,
    ...overrides?.props,
  };

  cy.mount(ImagesAndText, { props });
};

describe("ImagesAndText", () => {
  const clickPrev = () => cy.get("button[aria-label='Previous']").click();
  const clickNext = () => cy.get("button[aria-label='Next']").click();
  const getImagesWrapper = () => cy.getByTestId("images-and-text-images");

  describe("default", () => {
    beforeEach(() => {
      renderComponent();
    });

    const assertIndexVisible = (index: 0 | 1 | 2): void => {
      [0, 1, 2].forEach((i) => {
        getImagesWrapper().within(() => {
          cy.get("img")
            .eq(i)
            .should(
              "have.attr",
              "data-current",
              i === index ? "true" : "false"
            );
        });
      });
    };

    const assertImageInLocation = (index: 0 | 1 | 2, top: string): void => {
      getImagesWrapper().within(() => {
        cy.get("img")
          .eq(index)
          .invoke("attr", "style")
          .should("contain", `top: ${top}`);
      });
    };

    it("renders all images", () => {
      getImagesWrapper().within(() => {
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
    });

    it("first image is visible", () => {
      assertIndexVisible(0);
    });

    it("images are in correct position", () => {
      assertImageInLocation(0, "4%");
      assertImageInLocation(1, "110%");
      assertImageInLocation(2, "110%");
    });

    describe("clicking prev", () => {
      beforeEach(() => {
        clickPrev();
      });

      it("first image is visible", () => {
        assertIndexVisible(0);
      });
    });

    describe("clicking next", () => {
      beforeEach(() => {
        clickNext();
      });

      it("shows second image", () => {
        assertIndexVisible(1);
      });

      it("images are in correct position", () => {
        assertImageInLocation(0, "2%");
        assertImageInLocation(1, "6%");
        assertImageInLocation(2, "110%");
      });

      describe("clicking next (second time)", () => {
        beforeEach(() => {
          clickNext();
        });

        it("shows third image", () => {
          assertIndexVisible(2);
        });

        it("images are in correct position", () => {
          assertImageInLocation(0, "0%");
          assertImageInLocation(1, "4%");
          assertImageInLocation(2, "8%");
        });

        describe("clicking prev", () => {
          beforeEach(() => {
            clickPrev();
          });

          it("shows second image", () => {
            assertIndexVisible(1);
          });
        });

        describe("clicking next (third time)", () => {
          beforeEach(() => {
            clickNext();
          });

          it("shows third image", () => {
            assertIndexVisible(2);
          });
        });
      });
    });
  });

  describe("many images", () => {
    beforeEach(() => {
      renderComponent({
        props: {
          images: Array.from({ length: 12 }).map(() => finnyImg),
        },
      });
    });

    it("displays correctly", () => {
      getImagesWrapper().within(() => {
        cy.get("img")
          .eq(0)
          .invoke("attr", "style")
          .should("contain", "top: 22%")
          .should("contain", "height: 56%");
      });
    });

    describe("showing all images", () => {
      beforeEach(() => {
        Array.from({ length: 11 }).forEach(() => {
          clickNext();
        });
      });

      it("displays images correctly", () => {
        getImagesWrapper().within(() => {
          cy.get("img").should("have.length", 12);

          cy.get("img")
            .eq(0)
            .invoke("attr", "style")
            .should("contain", "top: 0%");

          cy.get("img")
            .eq(11)
            .invoke("attr", "style")
            .should("contain", "top: 44%");
        });
      });
    });
  });

  describe("custom image size", () => {
    beforeEach(() => {
      renderComponent({
        props: {
          imageSize: 300,
        },
      });
    });

    it("renders images at correct height", () => {
      getImagesWrapper().within(() => {
        cy.get("img")
          .eq(0)
          .then(([img]) => {
            expect(img.offsetHeight).to.eq(300 * 0.92);
          });
      });
    });
  });
});
