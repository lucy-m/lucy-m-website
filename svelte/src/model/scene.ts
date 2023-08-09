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
}

export type SceneAction =
  | { kind: "interact"; position: Position }
  | { kind: "tick" };

export const applySceneAction = <TLayerKey extends string>(
  scene: SceneType<TLayerKey>,
  images: Record<AssetKey, HTMLImageElement>,
  action: SceneAction
): SceneType<TLayerKey> => {
  if (action.kind === "tick") {
    const objects = scene.objects.map((obj) => {
      const objectActions: SceneObjectAction<unknown>[] | undefined =
        obj.onTick && obj.onTick(obj);

      return (
        objectActions?.reduce(
          (acc, next) => applySceneObjectAction(acc, next),
          obj
        ) ?? obj
      );
    });

    return { ...scene, objects };
  } else {
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

    const newObject =
      objectActions?.reduce(
        (acc, next) => applySceneObjectAction(acc, next),
        interactObject
      ) ?? interactObject;

    const newObjects = scene.objects.map((obj) =>
      obj.id === newObject.id ? newObject : obj
    );

    return { ...scene, objects: newObjects };
  }
};
