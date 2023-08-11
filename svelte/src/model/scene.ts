import type { Observable } from "rxjs";
import { choose } from "../utils";
import type { AssetKey } from "./assets";
import type { Position } from "./position";
import {
  applySceneObjectAction,
  getBoundingBox,
  getObjectsInOrder,
  type SceneObject,
  type SceneObjectAction,
} from "./scene-object";

export interface SceneType<TLayerKey extends string> {
  objects: SceneObject<TLayerKey, unknown>[];
  /** Order of layer drawing, from bottom to top */
  layerOrder: TLayerKey[];
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
  objectActions: SceneObjectAction<unknown>[],
  interactObjectId: string
): SceneType<TLayerKey> => {
  const byId = objectActions.reduce<
    Record<string, SceneObjectAction<unknown>[] | undefined>
  >((acc, next) => {
    const target = next.target ?? interactObjectId;

    return { ...acc, [target]: [...(acc[target] ?? []), next] };
  }, {});

  const newObjects = choose(
    scene.objects.map((obj) => {
      const myActions = byId[obj.id];

      const removeAction = myActions?.some((a) => a.kind === "removeObject");

      if (removeAction) {
        return "remove";
      }

      return (
        myActions?.reduce((acc, next) => {
          const result = applySceneObjectAction(acc, next);
          return result.kind === "removeObject" ? acc : result.object;
        }, obj) ?? obj
      );
    }),
    (object) => (object === "remove" ? undefined : object)
  );

  return { ...scene, objects: newObjects };
};

export const applySceneAction = <TLayerKey extends string>(
  scene: SceneType<TLayerKey>,
  images: Record<AssetKey, HTMLImageElement>,
  action: SceneEvent | SceneAction<TLayerKey>
): SceneType<TLayerKey> => {
  if (action.kind === "tick") {
    return scene.objects.reduce((acc, obj) => {
      const objectActions: SceneObjectAction<unknown>[] | undefined =
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
      const boundingBox = getBoundingBox(sceneObj, images);
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
