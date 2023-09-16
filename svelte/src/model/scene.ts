import type { Subscription } from "rxjs";
import { partitionByAllKinds } from "../utils";
import type { AssetKey } from "./assets";
import { getObjectBoundingBox, getObjectsInOrder } from "./scene-object";
import type {
  SceneAction,
  SceneEvent,
  SceneObject,
  SceneType,
} from "./scene-types";

type ApplySceneActionResult =
  | {
      kind: "newScene";
      scene: SceneType;
    }
  | {
      kind: "updated";
    }
  | { kind: "noChange" };

export const makeSceneType = (
  scene: Pick<
    SceneType,
    "typeName" | "layerOrder" | "events" | "onObjectEvent"
  > & {
    objects: readonly SceneObject[];
  }
): SceneType => {
  let objects: SceneObject[] = [];
  let eventSubscriptions: Record<string, Subscription> = {};

  const getObjects = () => objects;
  const addObject = (obj: SceneObject) => {
    if (!objects.find((so) => so.id === obj.id)) {
      if (obj.events$) {
        const subscription = obj.events$.subscribe(
          (event) => scene.onObjectEvent && scene.onObjectEvent(obj.id, event)
        );
        eventSubscriptions[obj.id] = subscription;
      }
      objects.push(obj);
    }
  };

  const removeObject = (id: string) => {
    objects = objects.filter((obj) => obj.id !== id);

    const sub = eventSubscriptions[id];
    sub?.unsubscribe();
    delete eventSubscriptions[id];
  };

  const destroy = () => {
    Object.values(eventSubscriptions).forEach((sub) => sub.unsubscribe());
  };

  scene.objects.forEach(addObject);

  return {
    ...scene,
    getObjects,
    addObject,
    removeObject,
    destroy,
  };
};

export const applySceneEvent = (
  scene: SceneType,
  images: Record<AssetKey, HTMLImageElement>,
  event: SceneEvent | SceneAction
): ApplySceneActionResult => {
  if (event.kind === "tick") {
    const tickActions = scene.getObjects().flatMap((obj) => {
      if (obj.onTick) {
        return obj.onTick();
      } else {
        return [];
      }
    });

    return applySceneActions(scene, tickActions);
  } else if (event.kind === "interact") {
    const objectsInOrder = getObjectsInOrder(
      scene.getObjects().filter((obj) => obj.onInteract),
      scene.layerOrder,
      "top-to-bottom"
    );

    const interactObject = objectsInOrder.find((sceneObj) => {
      const boundingBox = getObjectBoundingBox(sceneObj, images);
      return (
        event.position.x > boundingBox.topLeft.x &&
        event.position.x < boundingBox.bottomRight.x &&
        event.position.y > boundingBox.topLeft.y &&
        event.position.y < boundingBox.bottomRight.y
      );
    });

    if (!interactObject) {
      return { kind: "noChange" };
    }

    const objectActions =
      interactObject.onInteract && interactObject.onInteract();

    if (!objectActions) {
      return { kind: "noChange" };
    } else {
      return applySceneActions(scene, objectActions);
    }
  } else {
    return applySceneActions(scene, [event]);
  }
};

const applySceneActions = (
  scene: SceneType,
  actions: readonly SceneAction[]
): ApplySceneActionResult => {
  const byType = partitionByAllKinds(actions);

  const changeSceneAction = byType.changeScene?.[0];
  if (changeSceneAction) {
    return { kind: "newScene", scene: changeSceneAction.makeScene() };
  }

  const addedObjects =
    byType.addObject?.map(({ makeObject }) => makeObject()) ?? [];
  const removedIds = new Set(
    byType.removeObject?.map(({ target }) => target) ?? []
  );

  addedObjects.forEach((obj) => scene.addObject(obj));
  removedIds.forEach((id) => scene.removeObject(id));

  return {
    kind: "updated",
  };
};
