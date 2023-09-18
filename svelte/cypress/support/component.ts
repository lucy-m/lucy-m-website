// ***********************************************************
// This example support/component.ts is processed and
// loaded automatically before your test files.
//
// This is a great place to put global configuration and
// behavior that modifies Cypress.
//
// You can change the location of this file or turn off
// automatically serving support files with the
// 'supportFile' configuration option.
//
// You can read more here:
// https://on.cypress.io/configuration
// ***********************************************************

// Import commands.js using ES2015 syntax:
import "@percy/cypress";
import type {
  ComponentProps,
  ComponentType,
  SvelteComponentTyped,
} from "svelte";

// Alternatively you can use CommonJS syntax:
// require('./commands')

import { mount } from "cypress/svelte";
import type { SceneObject } from "../../src/model";
import Fixture from "./Fixture.svelte";
import SceneObjectFixture from "./SceneObjectFixture.svelte";
import ViewSceneFixture from "./ViewSceneFixture.svelte";
import type { FixtureOptions } from "./fixture-options";

// Augment the Cypress namespace to include type definitions for
// your custom command.
// Alternatively, can be defined in cypress/support/component.d.ts
// with a <reference path="./component" /> at the top of your spec.
declare global {
  namespace Cypress {
    interface Chainable {
      mount: typeof mount;
      mountWithFixture: typeof mountWithFixture;
      mountViewScene: typeof mountViewScene;
      mountSceneObject: typeof mountSceneObject;
      getByTestId: typeof getByTestId;
      steppedTick: typeof steppedTick;
      assertObjectsMatch: typeof assertObjectsMatch;
      interactiveWait: typeof interactiveWait;
      myWaitFor: typeof myWaitFor;
    }
  }
}

const getByTestId = (testId: string) => {
  return cy.get(`[data-testid="${testId}"]`);
};

const mountWithFixture = <T extends Record<string, any>>(
  componentType: ComponentType<SvelteComponentTyped<T>>,
  props: T,
  fixtureOptions?: FixtureOptions
) => {
  cy.mount(Fixture, { props: { componentType, props, fixtureOptions } });
};

const mountViewScene = (
  props: ComponentProps<ViewSceneFixture>
): Cypress.Chainable => {
  cy.viewport(1400, 820);

  cy.mount(ViewSceneFixture, { props });
  return cy.get("canvas").should("have.attr", "data-initialised", "true");
};

const mountSceneObject = (
  props: ComponentProps<SceneObjectFixture>
): Cypress.Chainable => {
  cy.viewport(1400, 820);
  cy.mount(SceneObjectFixture, { props });
  return cy.get("canvas").should("have.attr", "data-initialised", "true");
};

const steppedTick = (
  by: number,
  options?: Partial<Cypress.Loggable>
): Cypress.Chainable => {
  if (options?.log !== false) {
    cy.log(`Tick ${by}`);
  }

  const dt = 30;
  Array.from({ length: by / dt - 1 }).forEach(() => {
    cy.tick(dt, { log: false });
  });

  return cy.tick(dt, { log: false });
};

const assertObjectsMatch = (objectA: SceneObject, objectB: SceneObject) => {
  expect(objectA.getLayers()).to.deep.equal(objectB.getLayers());

  for (const key in objectA) {
    const valueA = (objectA as Record<string, unknown>)[key];

    if (typeof valueA === "function") {
      continue;
    } else {
      const valueB = (objectB as Record<string, unknown>)[key];
      expect(valueA).to.deep.equal(valueB);
    }
  }
};

/**
 * In interactive mode, will wait for time. In non-interactive mode, will advance the clock.
 * @param interactive - Value of `Cypress.config("isInteractive")`
 */
const interactiveWait = (
  time: number,
  interactive: boolean,
  options?: Partial<Cypress.Loggable>
): Cypress.Chainable => {
  if (interactive) {
    return cy.wait(time, options);
  } else {
    return cy.steppedTick(time, options);
  }
};

const myWaitFor = (
  predicate: () => boolean,
  interactive: boolean,
  options?: {
    /** Maximum time in ms to wait. Default 4000ms. */
    timeout?: number;
  }
): Cypress.Chainable => {
  const step = 100;
  const timeout = options?.timeout ?? 4000;

  const inner = (progress: number): Cypress.Chainable => {
    return interactiveWait(100, interactive, { log: false }).then(() => {
      if (predicate()) {
        return;
      } else {
        if (progress > timeout) {
          throw new Error(`Maximum waitfor timeout of ${timeout}ms reached`);
        }
        return inner(progress + step);
      }
    });
  };

  return inner(0);
};

Cypress.Commands.add("mount", mount);
Cypress.Commands.add("mountWithFixture", mountWithFixture);
Cypress.Commands.add("mountViewScene", mountViewScene);
Cypress.Commands.add("mountSceneObject", mountSceneObject);
Cypress.Commands.add("getByTestId", getByTestId);
Cypress.Commands.add("steppedTick", steppedTick);
Cypress.Commands.add("assertObjectsMatch", assertObjectsMatch);
Cypress.Commands.add("interactiveWait", interactiveWait);
Cypress.Commands.add("myWaitFor", myWaitFor);
