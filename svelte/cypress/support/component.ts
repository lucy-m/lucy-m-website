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
import type { ComponentType, SvelteComponentTyped } from "svelte";

// Alternatively you can use CommonJS syntax:
// require('./commands')

import { mount } from "cypress/svelte";
import type { SceneObject } from "../../src/model";
import Fixture from "./Fixture.svelte";
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
      getByTestId: typeof getByTestId;
      steppedTick: typeof steppedTick;
      assertObjectsMatch: typeof assertObjectsMatch;
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

const steppedTick = (by: number): Cypress.Chainable => {
  cy.log(`Tick ${by}`);

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

Cypress.Commands.add("mount", mount);
Cypress.Commands.add("mountWithFixture", mountWithFixture);
Cypress.Commands.add("getByTestId", getByTestId);
Cypress.Commands.add("steppedTick", steppedTick);
Cypress.Commands.add("assertObjectsMatch", assertObjectsMatch);
