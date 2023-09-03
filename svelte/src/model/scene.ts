import type { Observable } from "rxjs";
import { choose } from "../utils";
import type { AssetKey } from "./assets";
import type { Position } from "./position";
import {
  applySceneObjectAction,
  getObjectBoundingBox,
  getObjectsInOrder,
  type SceneObject,
  type SceneObjectAction,
} from "./scene-object";

export interface SceneType<TLayerKey extends string> {
  objects: readonly SceneObject<TLayerKey, unknown>[];
  /** Order of layer drawing, from bottom to top */
  layerOrder: readonly TLayerKey[];
  actions: Observable<SceneAction<TLayerKey>>;
}

export type SceneAction<TLayerKey extends string> = {
  kind: "addObject";
  makeObject: () => SceneObject<TLayerKey, unknown>;
};

export type SceneEvent =
  | { kind: "interact"; position: Position }
  | { kind: "tick" };

const applySceneObjectActions = <TLayerKey extends string>(
  scene: SceneType<TLayerKey>,
  objectActions: SceneObjectAction<TLayerKey, unknown>[],
  interactObjectId: string
): SceneType<TLayerKey> => {
  const byId = objectActions.reduce<
    Record<string, SceneObjectAction<TLayerKey, unknown>[] | undefined>
  >((acc, next) => {
    const target = ("target" in next && next.target) || interactObjectId;

    return { ...acc, [target]: [...(acc[target] ?? []), next] };
  }, {});

  const newObjects = scene.objects.flatMap((obj) => {
    const myActions = byId[obj.id];

    const removeAction = myActions?.some((a) => a.kind === "removeObject");

    const newObjects =
      (myActions &&
        choose(myActions, (obj) =>
          obj.kind === "addObject" ? obj.makeObject() : undefined
        )) ??
      [];

    if (removeAction) {
      return newObjects;
    }

    const updatedObject =
      myActions?.reduce((acc, next) => {
        const result = applySceneObjectAction(acc, next);
        return result.kind === "removeObject" || result.kind === "addObject"
          ? acc
          : result.object;
      }, obj) ?? obj;

    return [updatedObject, ...newObjects];
  });

  return { ...scene, objects: newObjects };
};

export const applySceneAction = <TLayerKey extends string>(
  scene: SceneType<TLayerKey>,
  images: Record<AssetKey, HTMLImageElement>,
  action: SceneEvent | SceneAction<TLayerKey>
): SceneType<TLayerKey> => {
  if (action.kind === "tick") {
    return scene.objects.reduce((acc, obj) => {
      const objectActions: SceneObjectAction<TLayerKey, unknown>[] | undefined =
        obj.onTick && obj.onTick(obj);

      if (!objectActions) {
        return acc;
      } else {
        return applySceneObjectActions(acc, objectActions, obj.id);
      }
    }, scene);
  } else if (action.kind === "interact") {
    const objectsInOrder = getObjectsInOrder(
      scene.objects.filter((obj) => obj.onInteract),
      scene.layerOrder,
      "top-to-bottom"
    );

    const interactObject = objectsInOrder.find((sceneObj) => {
      const boundingBox = getObjectBoundingBox(sceneObj, images);
      return (
        action.position.x > boundingBox.topLeft.x &&
        action.position.x < boundingBox.bottomRight.x &&
        action.position.y > boundingBox.topLeft.y &&
        action.position.y < boundingBox.bottomRight.y
      );
    });

    if (!interactObject) {
      return scene;
    }

    const objectActions =
      interactObject.onInteract && interactObject.onInteract(interactObject);

    if (!objectActions) {
      return scene;
    } else {
      return applySceneObjectActions(scene, objectActions, interactObject.id);
    }
  } else {
    const objects = [...scene.objects, action.makeObject()];

    return { ...scene, objects };
  }
};
