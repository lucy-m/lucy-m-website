import Sinon from "cypress/types/sinon";
import { Subject, of } from "rxjs";
import seedrandom from "seedrandom";
import type { AssetKey } from "../assets";
import { PosFns } from "../position";
import { makeSceneType } from "../scene";
import { makeSceneObject } from "../scene-object";
import type { SceneObject, SceneObjectEvent, SceneType } from "../scene-types";

describe("scene", () => {
  const random = seedrandom();
  const images = {} as Record<AssetKey, HTMLImageElement>;

  const makeTestSceneObject = (
    optional?: Pick<SceneObject, "onTick" | "events$">
  ): SceneObject =>
    makeSceneObject(random)({
      getLayers: () => [],
      layerKey: "",
      getPosition: () => PosFns.new(0, 0),
      onTick: optional?.onTick,
      events$: optional?.events$,
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
    let objectAEvents: Subject<SceneObjectEvent>;
    let scene: SceneType;

    const getOnObjectEventSpy = () =>
      cy.get<Sinon.SinonSpy>("@onObjectEventSpy");

    beforeEach(() => {
      objectAEvents = new Subject();
      objectA = makeTestSceneObject({
        events$: objectAEvents,
      });

      scene = makeTestScene([objectA], {
        onObjectEvent: cy.spy().as("onObjectEventSpy"),
      });
    });

    it("abitrary objectA event calls onObjectEvent", () => {
      const event = { a: "hello", b: "world" };
      objectAEvents.next({ kind: "arbitrary", event });

      getOnObjectEventSpy()
        .should("have.been.calledOnce")
        .should("have.been.calledWith", { sourceObjectId: objectA.id, event });
    });

    it("sceneAction addObject event updates the scene", () => {
      const newObject = makeTestSceneObject();
      objectAEvents.next({
        kind: "sceneAction",
        action: { kind: "addObject", makeObject: () => newObject },
      });
      expect(scene.getObjects()).to.have.length(2);
    });

    it("sceneAction removeObject event updates the scene", () => {
      objectAEvents.next({
        kind: "sceneAction",
        action: { kind: "removeObject", target: objectA.id },
      });
      expect(scene.getObjects()).to.have.length(0);
    });

    describe("adding objectB", () => {
      let objectB: SceneObject;
      let objectBEvents: Subject<SceneObjectEvent>;

      beforeEach(() => {
        objectBEvents = new Subject();
        objectB = makeTestSceneObject({
          events$: objectBEvents,
        });

        scene.addObject(objectB);
      });

      it("arbitrary objectB event calls onObjectEvent", () => {
        const event = ["foo", 3];
        objectBEvents.next({ kind: "arbitrary", event });

        getOnObjectEventSpy()
          .should("have.been.calledOnce")
          .should("have.been.calledWith", {
            sourceObjectId: objectB.id,
            event,
          });
      });
    });

    describe("removing objectA", () => {
      beforeEach(() => {
        scene.removeObject(objectA.id);
      });

      it("arbitrary objectA event does not call onObjectEvent", () => {
        const event = { a: "hello", b: "world" };
        objectAEvents.next({ kind: "arbitrary", event });

        getOnObjectEventSpy().should("not.have.been.called");
      });
    });

    describe("calling onDestroy", () => {
      beforeEach(() => {
        scene.destroy();
      });

      it("arbitrary objectA event does not call onObjectEvent", () => {
        const event = { a: "hello", b: "world" };
        objectAEvents.next({ kind: "arbitrary", event });

        getOnObjectEventSpy().should("not.have.been.called");
      });
    });
  });
});
