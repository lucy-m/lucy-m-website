import { choose, partitionByKind } from "../utils";
import type { AssetKey } from "./assets";
import {
  applySceneObjectAction,
  getObjectBoundingBox,
  getObjectsInOrder,
} from "./scene-object";
import type {
  SceneAction,
  SceneEvent,
  SceneObjectAction,
  SceneType,
} from "./scene-types";

const applySceneObjectActions = <TLayerKey extends string>(
  scene: SceneType<TLayerKey>,
  objectActions: SceneObjectAction<TLayerKey>[],
  interactObjectId: string
): { scene: SceneType<TLayerKey>; sceneActions: SceneAction<TLayerKey>[] } => {
  const sceneActions = choose(objectActions, (action) =>
    action.kind === "sceneAction" ? action.action : undefined
  );

  const byId = objectActions.reduce<
    Record<string, SceneObjectAction<TLayerKey>[] | undefined>
  >((acc, next) => {
    const target = ("target" in next && next.target) || interactObjectId;

    return { ...acc, [target]: [...(acc[target] ?? []), next] };
  }, {});

  const newObjects = choose(scene.objects, (obj) => {
    const myActions = byId[obj.id];

    const removeAction = myActions?.some((a) => a.kind === "removeObject");

    if (removeAction) {
      return undefined;
    }

    const updatedObject =
      myActions?.reduce((acc, next) => {
        const result = applySceneObjectAction(acc, next);
        return result.kind === "removeObject" || result.kind === "sceneAction"
          ? acc
          : result.object;
      }, obj) ?? obj;

    return updatedObject;
  });

  return { scene: { ...scene, objects: newObjects }, sceneActions };
};

type ApplySceneActionResult<TLayerKey extends string> =
  | {
      kind: "newScene";
      scene: SceneType<string>;
    }
  | {
      kind: "updated";
      scene: SceneType<TLayerKey>;
    };

export const applySceneEvent = <TLayerKey extends string>(
  scene: SceneType<TLayerKey>,
  images: Record<AssetKey, HTMLImageElement>,
  event: SceneEvent | SceneAction<TLayerKey>
): ApplySceneActionResult<TLayerKey> => {
  if (event.kind === "tick") {
    interface Accumulator {
      scene: SceneType<TLayerKey>;
      sceneActions: readonly SceneAction<TLayerKey>[];
    }

    const reduceResult = scene.objects.reduce<Accumulator>(
      (acc, obj) => {
        const objectActions: SceneObjectAction<TLayerKey>[] | undefined =
          obj.onTick && obj.onTick();

        if (!objectActions) {
          return acc;
        } else {
          const actionResult = applySceneObjectActions(
            acc.scene,
            objectActions,
            obj.id
          );

          return {
            scene: actionResult.scene,
            sceneActions: [...acc.sceneActions, ...actionResult.sceneActions],
          };
        }
      },
      { scene, sceneActions: [] }
    );

    return applySceneActions(reduceResult.scene, reduceResult.sceneActions);
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
      const actionResult = applySceneObjectActions(
        scene,
        objectActions,
        interactObject.id
      );

      return applySceneActions(actionResult.scene, actionResult.sceneActions);
    }
  } else {
    return applySceneActions(scene, [event]);
  }
};

const applySceneActions = <TLayerKey extends string>(
  scene: SceneType<TLayerKey>,
  actions: readonly SceneAction<TLayerKey>[]
): ApplySceneActionResult<TLayerKey> => {
  const byType = partitionByKind(actions, "changeScene");

  const changeSceneAction = byType.changeScene?.[0];
  if (changeSceneAction) {
    return { kind: "newScene", scene: changeSceneAction.makeScene() };
  }

  const updated = byType.other.reduce<SceneType<TLayerKey>>((acc, action) => {
    const objects = [...acc.objects, action.makeObject()];
    return { ...acc, objects };
  }, scene);

  return { kind: "updated", scene: updated };
};
