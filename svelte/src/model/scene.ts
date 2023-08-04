import {
  applySceneObjectAction,
  type SceneObject,
  type SceneObjectAction,
} from "./scene-object";

export interface SceneType<TLayerKey extends string> {
  objects: SceneObject<TLayerKey>[];
  layerOrder: TLayerKey[];
}

export type SceneAction = { kind: "interact" } | { kind: "tick" };

export const applySceneAction = <TLayerKey extends string>(
  scene: SceneType<TLayerKey>,
  action: SceneAction
): SceneType<TLayerKey> => {
  const objects = scene.objects.map((obj) => {
    const objectAction: SceneObjectAction | undefined = (() => {
      switch (action.kind) {
        case "interact":
          return obj.onInteract && obj.onInteract(obj);
        case "tick":
          return obj.onTick && obj.onTick(obj);
      }
    })();

    if (objectAction) {
      return applySceneObjectAction(obj, objectAction);
    } else {
      return obj;
    }
  });

  return { ...scene, objects };
};
