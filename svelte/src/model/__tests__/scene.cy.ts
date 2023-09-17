import Sinon from "cypress/types/sinon";
import { Subject, of } from "rxjs";
import seedrandom from "seedrandom";
import type { AssetKey } from "../assets";
import { PosFns } from "../position";
import { makeSceneType } from "../scene";
import { makeSceneObject } from "../scene-object";
import type { SceneAction, SceneObject, SceneType } from "../scene-types";

describe("scene", () => {
  const random = seedrandom();
  const images = {} as Record<AssetKey, HTMLImageElement>;

  const makeTestSceneObject = (
    optional?: Pick<SceneObject, "onTick" | "events$" | "onDestroy">
  ): SceneObject =>
    makeSceneObject(random)({
      getLayers: () => [],
      layerKey: "",
      getPosition: () => PosFns.new(0, 0),
      ...optional,
    });

  const makeTestScene = (
    objects: SceneObject[],
    optional?: Pick<SceneType, "onObjectEvent">
  ): SceneType =>
    makeSceneType({
      typeName: "test-scene",
      events: of(),
      layerOrder: [],
      objects,
      onObjectEvent: optional?.onObjectEvent,
    })(images, () => {});

  it("does not add duplicate objects", () => {
    const object = makeTestSceneObject();
    const scene = makeTestScene([object, object, object]);

    expect(scene.getObjects()).to.have.length(1);
  });

  describe("object events", () => {
    let objectA: SceneObject;
    let objectAEvents: Subject<SceneAction>;
    let scene: SceneType;

    const getOnObjectEventSpy = () =>
      cy.get<Sinon.SinonSpy>("@onObjectEventSpy");

    beforeEach(() => {
      objectAEvents = new Subject();
      objectA = makeTestSceneObject({
        events$: objectAEvents,
        onDestroy: cy.spy().as("onADestroySpy"),
      });

      scene = makeTestScene([objectA], {
        onObjectEvent: cy.spy().as("onObjectEventSpy"),
      });
    });

    it("abitrary objectA event calls onObjectEvent", () => {
      const event = { a: "hello", b: "world" };
      objectAEvents.next({ kind: "emitEvent", event });

      getOnObjectEventSpy()
        .should("have.been.calledOnce")
        .should("have.been.calledWith", event);
    });

    it("sceneAction addObject event updates the scene", () => {
      const newObject = makeTestSceneObject();
      objectAEvents.next({ kind: "addObject", makeObject: () => newObject });
      expect(scene.getObjects()).to.have.length(2);
    });

    it("sceneAction removeObject event updates the scene", () => {
      cy.get("@onADestroySpy")
        .should("not.have.been.called")
        .then(() => {
          objectAEvents.next({ kind: "removeObject", target: objectA.id });
          expect(scene.getObjects()).to.have.length(0);
          cy.get("@onADestroySpy").should("have.been.calledOnce");
        });
    });

    describe("adding objectB", () => {
      let objectB: SceneObject;
      let objectBEvents: Subject<SceneAction>;

      beforeEach(() => {
        objectBEvents = new Subject();
        objectB = makeTestSceneObject({
          events$: objectBEvents,
        });

        scene.addObject(objectB);
      });

      it("emitEvent objectB event calls onObjectEvent", () => {
        const event = ["foo", 3];
        objectBEvents.next({ kind: "emitEvent", event });

        getOnObjectEventSpy()
          .should("have.been.calledOnce")
          .should("have.been.calledWith", event);
      });
    });

    describe("removing objectA", () => {
      beforeEach(() => {
        scene.removeObject(objectA.id);
      });

      it("emitEvent objectA event does not call onObjectEvent", () => {
        const event = { a: "hello", b: "world" };
        objectAEvents.next({ kind: "emitEvent", event });

        getOnObjectEventSpy().should("not.have.been.called");
      });
    });

    describe("calling onDestroy", () => {
      beforeEach(() => {
        scene.destroy();
      });

      it("emitEvent objectA event does not call onObjectEvent", () => {
        const event = { a: "hello", b: "world" };
        objectAEvents.next({ kind: "emitEvent", event });

        getOnObjectEventSpy().should("not.have.been.called");
      });
    });
  });
});
