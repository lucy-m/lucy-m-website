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
  const getPrev = () => cy.get("button[aria-label='Previous']");
  const getNext = () => cy.get("button[aria-label='Next']");

  const clickPrev = () => getPrev().click();
  const clickNext = () => getNext().click();

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
      assertImageInLocation(0, "20px");
      assertImageInLocation(1, "232px");
      assertImageInLocation(2, "232px");
    });

    it("previous button is disabled", () => {
      getPrev().should("be.disabled");
    });

    it("next button is enabled", () => {
      getNext().should("be.enabled");
    });

    describe("clicking next", () => {
      beforeEach(() => {
        clickNext();
      });

      it("shows second image", () => {
        assertIndexVisible(1);
      });

      it("images are in correct position", () => {
        assertImageInLocation(0, "16px");
        assertImageInLocation(1, "24px");
        assertImageInLocation(2, "232px");
      });

      it("previous button is enabled", () => {
        getPrev().should("be.enabled");
      });

      describe("clicking next (second time)", () => {
        beforeEach(() => {
          clickNext();
        });

        it("shows third image", () => {
          assertIndexVisible(2);
        });

        it("images are in correct position", () => {
          assertImageInLocation(0, "12px");
          assertImageInLocation(1, "20px");
          assertImageInLocation(2, "28px");
        });

        it("next button is disabled", () => {
          getNext().should("be.disabled");
        });

        describe("clicking prev", () => {
          beforeEach(() => {
            clickPrev();
          });

          it("shows second image", () => {
            assertIndexVisible(1);
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
          .should("contain", "top: 56px")
          .should("contain", "height: 112px");
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
            .should("contain", "top: 12px");

          cy.get("img")
            .eq(11)
            .invoke("attr", "style")
            .should("contain", "top: 100px");
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

  describe("single image", () => {
    beforeEach(() => {
      renderComponent({
        props: { images: [finnyImg] },
      });
    });

    it("buttons disabled", () => {
      getPrev().should("be.disabled");
      getNext().should("be.disabled");
    });
  });
});
