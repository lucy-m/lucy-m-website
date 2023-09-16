import { partitionByAllKinds } from "../utils";
import type { AssetKey } from "./assets";
import { getObjectBoundingBox, getObjectsInOrder } from "./scene-object";
import type { SceneAction, SceneEvent, SceneType } from "./scene-types";

type ApplySceneActionResult<TLayerKey extends string> =
  | {
      kind: "newScene";
      scene: SceneType<string>;
    }
  | {
      kind: "updated";
      scene: SceneType<TLayerKey>;
    };

export const makeSceneType = <TLayerKey extends string>(
  scene: SceneType<TLayerKey>
): SceneType<TLayerKey> => ({
  ...scene,
});

export const applySceneEvent = <TLayerKey extends string>(
  scene: SceneType<TLayerKey>,
  images: Record<AssetKey, HTMLImageElement>,
  event: SceneEvent | SceneAction<TLayerKey>
): ApplySceneActionResult<TLayerKey> => {
  if (event.kind === "tick") {
    const tickActions = scene.objects.flatMap((obj) => {
      if (obj.onTick) {
        return obj.onTick();
      } else {
        return [];
      }
    });

    return applySceneActions(scene, tickActions);
  } else if (event.kind === "interact") {
    const objectsInOrder = getObjectsInOrder(
      scene.objects.filter((obj) => obj.onInteract),
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
      return { kind: "updated", scene };
    }

    const objectActions =
      interactObject.onInteract && interactObject.onInteract();

    if (!objectActions) {
      return { kind: "updated", scene };
    } else {
      return applySceneActions(scene, objectActions);
    }
  } else {
    return applySceneActions(scene, [event]);
  }
};

const applySceneActions = <TLayerKey extends string>(
  scene: SceneType<TLayerKey>,
  actions: readonly SceneAction<TLayerKey>[]
): ApplySceneActionResult<TLayerKey> => {
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

  const newObjects = [
    ...scene.objects.filter((obj) => !removedIds.has(obj.id)),
    ...addedObjects,
  ];

  return {
    kind: "updated",
    scene: {
      ...scene,
      objects: newObjects,
    },
  };
};
