import type { Position } from "./position";
import {
  applySceneObjectAction,
  type SceneObject,
  type SceneObjectAction,
} from "./scene-object";

export interface SceneType<TLayerKey extends string> {
  objects: SceneObject<TLayerKey, unknown>[];
  layerOrder: TLayerKey[];
}

export type SceneAction =
  | { kind: "interact"; position: Position }
  | { kind: "tick" };

export const applySceneAction = <TLayerKey extends string>(
  scene: SceneType<TLayerKey>,
  action: SceneAction
): SceneType<TLayerKey> => {
  const objects = scene.objects.map((obj) => {
    const objectActions: SceneObjectAction<unknown>[] | undefined = (() => {
      switch (action.kind) {
        case "interact":
          return obj.onInteract && obj.onInteract(obj);
        case "tick":
          return obj.onTick && obj.onTick(obj);
      }
    })();

    return (
      objectActions?.reduce(
        (acc, next) => applySceneObjectAction(acc, next),
        obj
      ) ?? obj
    );
  });

  return { ...scene, objects };
};
