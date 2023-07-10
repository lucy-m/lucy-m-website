import { v4 as uuid } from "uuid";
import type { AssetKey } from "./assets";
import { type Position } from "./position";
import type { SubLayerKey } from "./sub-layer-key";

export type ObjectLayerContent =
  | {
      kind: "text";
      text: string[];
      position: Position;
      maxWidth: number;
    }
  | {
      kind: "image";
      assetKey: AssetKey;
      subLayer: SubLayerKey;
      position?: Position;
    };

export type SceneObjectAction =
  | {
      kind: "hide";
    }
  | { kind: "show" };

export type SceneObject<TLayerKey extends string> = {
  id: string;
  position: Position;
  hidden?: boolean;
  layerKey: TLayerKey;
  getLayers: () => ObjectLayerContent[];
  onInteract?: (current: SceneObject<string>) => SceneObjectAction | undefined;
};

export const makeSceneObject = <TLayerKey extends string>(
  obj: Omit<SceneObject<TLayerKey>, "id">
): SceneObject<TLayerKey> => {
  return {
    id: uuid(),
    ...obj,
  };
};

export interface SceneType<TLayerKey extends string> {
  objects: SceneObject<TLayerKey>[];
  layerOrder: TLayerKey[];
}

export const applySceneAction = <TLayerKey extends string>(
  scene: SceneType<TLayerKey>,
  action: SceneObjectAction,
  sourceId: string
): SceneType<TLayerKey> => {
  const objects = scene.objects.map((obj) => {
    if (obj.id === sourceId) {
      switch (action.kind) {
        case "hide":
          return {
            ...obj,
            hidden: true,
          };
        case "show":
          return {
            ...obj,
            hidden: false,
          };
      }
    } else {
      return obj;
    }
  });

  return {
    objects,
    layerOrder: scene.layerOrder,
  };
};
