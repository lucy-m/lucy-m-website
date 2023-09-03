import { choose } from "../utils";
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
  objectActions: SceneObjectAction<TLayerKey, unknown>[],
  interactObjectId: string
): { scene: SceneType<TLayerKey>; sceneActions: SceneAction<TLayerKey>[] } => {
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

const applySceneActions = <TLayerKey extends string>(
  scene: SceneType<TLayerKey>,
  actions: readonly SceneAction<TLayerKey>[]
): ApplySceneActionResult<TLayerKey> => {
  return actions.reduce<ApplySceneActionResult<TLayerKey>>(
    (acc, action) => {
      if (acc.kind === "newScene") {
        return acc;
      } else {
        if (action.kind === "addObject") {
          const objects = [...acc.scene.objects, action.makeObject()];
          return { kind: "updated", scene: { ...acc.scene, objects } };
        } else {
          return { kind: "newScene", scene: action.makeScene() };
        }
      }
    },
    { kind: "updated", scene }
  );
};
