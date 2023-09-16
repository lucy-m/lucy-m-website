import Sinon from "cypress/types/sinon";
import { Subject, of } from "rxjs";
import seedrandom from "seedrandom";
import type { AssetKey } from "../assets";
import { PosFns } from "../position";
import { applySceneEvent, makeSceneType } from "../scene";
import { makeSceneObject } from "../scene-object";
import type { SceneObject, SceneType } from "../scene-types";

describe("scene", () => {
  const random = seedrandom();

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
    });

  const images = {} as Record<AssetKey, HTMLImageElement>;

  it("does not add duplicate objects", () => {
    const object = makeTestSceneObject();
    const scene = makeTestScene([object, object, object]);

    expect(scene.getObjects()).to.have.length(1);
  });

  describe("applySceneEvent", () => {
    describe("remove action with target", () => {
      const objectB = makeTestSceneObject();
      const objectA = makeTestSceneObject({
        onTick: () => [{ kind: "removeObject", target: objectB.id }],
      });

      const scene = makeTestScene([objectA, objectB]);
      applySceneEvent(scene, images, { kind: "tick" });

      it("objectB is removed", () => {
        expect(scene.getObjects().map((o) => o.id)).to.be.deep.equal([
          objectA.id,
        ]);
      });
    });

    describe("add new object action", () => {
      const objectB = makeTestSceneObject();
      const objectA = makeTestSceneObject({
        onTick: () => [{ kind: "addObject", makeObject: () => objectB }],
      });

      const scene = makeTestScene([objectA]);
      applySceneEvent(scene, images, { kind: "tick" });

      it("adds objectB", () => {
        expect(scene.getObjects().map((o) => o.id)).to.deep.equal([
          objectA.id,
          objectB.id,
        ]);
      });
    });
  });

  describe("object events", () => {
    let objectA: SceneObject;
    let objectAEvents: Subject<any>;
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

    it("objectA event calls onObjectEvent", () => {
      const event = { a: "hello", b: "world" };
      objectAEvents.next(event);

      getOnObjectEventSpy()
        .should("have.been.calledOnce")
        .should("have.been.calledWith", objectA.id, event);
    });

    describe("adding objectB", () => {
      let objectB: SceneObject;
      let objectBEvents: Subject<any>;

      beforeEach(() => {
        objectBEvents = new Subject();
        objectB = makeTestSceneObject({
          events$: objectBEvents,
        });

        scene.addObject(objectB);
      });

      it("objectB event calls onObjectEvent", () => {
        const event = ["foo", 3];
        objectBEvents.next(event);

        getOnObjectEventSpy()
          .should("have.been.calledOnce")
          .should("have.been.calledWith", objectB.id, event);
      });
    });

    describe("removing objectA", () => {
      beforeEach(() => {
        scene.removeObject(objectA.id);
      });

      it("objectA event does not call onObjectEvent", () => {
        const event = { a: "hello", b: "world" };
        objectAEvents.next(event);

        getOnObjectEventSpy().should("not.have.been.called");
      });
    });
  });
});
