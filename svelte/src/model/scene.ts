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

  const newObjects = scene.objects.map((obj) => {
    const myActions = byId[obj.id];

    return (
      myActions?.reduce(
        (acc, next) => applySceneObjectAction(acc, next),
        obj
      ) ?? obj
    );
  });

  return { ...scene, objects: newObjects };
};

export const applySceneAction = <TLayerKey extends string>(
  scene: SceneType<TLayerKey>,
  images: Record<AssetKey, HTMLImageElement>,
  action: SceneAction
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

    if (!objectActions) {
      return scene;
    } else {
      return applySceneObjectActions(scene, objectActions, interactObject.id);
    }
  }
};
