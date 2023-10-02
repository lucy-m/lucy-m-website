import { GameMenu } from "../overlays";

describe("gameMenu", () => {
  beforeEach(() => {
    cy.mountWithFixture(GameMenu, {
      unmountSelf: cy.spy().as("unmountSelfSpy"),
      state: {
        level: 5,
        levelXp: 20,
        nextLevelXp: 200,
        totalXp: 600,
      },
    });
  });

  it("shows current state", () => {
    cy.contains("Level 5");
    cy.contains("XP 20/200");
  });

  it("close button closes", () => {
    cy.contains("button", "Close").click();
    cy.get("@unmountSelfSpy").should("have.been.calledOnce");
  });
});
