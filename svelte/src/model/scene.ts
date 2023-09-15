import { choose, partitionByKind } from "../utils";
import type { AssetKey } from "./assets";
import {
  applySceneObjectAction,
  getObjectBoundingBox,
  getObjectsInOrder,
} from "./scene-object";
import type {
  EmptyState,
  SceneAction,
  SceneEvent,
  SceneObjectAction,
  SceneType,
  SceneTypeStateless,
} from "./scene-types";

export const makeSceneTypeStateful = <TLayerKey extends string, TSceneState>(
  sceneType: SceneType<TLayerKey, TSceneState>
): SceneType<TLayerKey, TSceneState> => {
  return sceneType;
};

export const makeSceneTypeStateless = <TLayerKey extends string>(
  sceneType: Omit<SceneType<TLayerKey, EmptyState>, "state">
): SceneTypeStateless<TLayerKey> => ({
  ...sceneType,
  state: {},
});

const applySceneObjectActions = <TLayerKey extends string, TSceneState>(
  scene: SceneType<TLayerKey, TSceneState>,
  objectActions: SceneObjectAction<TLayerKey, unknown>[],
  interactObjectId: string
): {
  scene: SceneType<TLayerKey, TSceneState>;
  sceneActions: SceneAction<TLayerKey>[];
} => {
  const sceneActions = choose(objectActions, (action) =>
    action.kind === "sceneAction" ? action.action : undefined
  );

  const byId = objectActions.reduce<
    Record<string, SceneObjectAction<TLayerKey, unknown>[] | undefined>
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

type ApplySceneActionResult<TLayerKey extends string, TSceneState> =
  | {
      kind: "newScene";
      scene: SceneType<string, TSceneState>;
    }
  | {
      kind: "updated";
      scene: SceneType<TLayerKey, TSceneState>;
    };

export const applySceneEvent = <TLayerKey extends string, TSceneState>(
  scene: SceneType<TLayerKey, TSceneState>,
  images: Record<AssetKey, HTMLImageElement>,
  event: SceneEvent | SceneAction<TLayerKey>
): ApplySceneActionResult<TLayerKey, unknown> => {
  if (event.kind === "tick") {
    interface Accumulator {
      scene: SceneType<TLayerKey, TSceneState>;
      sceneActions: readonly SceneAction<TLayerKey>[];
    }

    const reduceResult = scene.objects.reduce<Accumulator>(
      (acc, obj) => {
        const objectActions:
          | SceneObjectAction<TLayerKey, unknown>[]
          | undefined = obj.onTick && obj.onTick(obj);

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
      interactObject.onInteract && interactObject.onInteract(interactObject);

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

const applySceneActions = <TLayerKey extends string, TSceneState>(
  scene: SceneType<TLayerKey, TSceneState>,
  actions: readonly SceneAction<TLayerKey>[]
): ApplySceneActionResult<TLayerKey, unknown> => {
  const byType = partitionByKind(actions, "changeScene");

  const changeSceneAction = byType.changeScene?.[0];
  if (changeSceneAction) {
    return { kind: "newScene", scene: changeSceneAction.makeScene() };
  }

  const updated = byType.other.reduce<SceneType<TLayerKey, unknown>>(
    (acc, action) => {
      const objects = [...acc.objects, action.makeObject()];
      return { ...acc, objects };
    },
    scene
  );

  return { kind: "updated", scene: updated };
};
