import { v4 as uuid } from "uuid";
import type { AssetKey } from "./assets";
import { PosFns, type Position } from "./position";
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
  | { kind: "show" }
  | { kind: "moveBy"; by: Position }
  | { kind: "moveTo"; to: Position };

export type SceneObject<TLayerKey extends string> = {
  id: string;
  position: Position;
  hidden?: boolean;
  layerKey: TLayerKey;
  getLayers: () => ObjectLayerContent[];
  onInteract?: (current: SceneObject<string>) => SceneObjectAction | undefined;
  onTick?: (current: SceneObject<string>) => SceneObjectAction | undefined;
};

export const makeSceneObject = <TLayerKey extends string>(
  obj: Omit<SceneObject<TLayerKey>, "id">
): SceneObject<TLayerKey> => {
  return {
    id: uuid(),
    ...obj,
  };
};

export const applySceneObjectAction = <TLayerKey extends string>(
  obj: SceneObject<TLayerKey>,
  action: SceneObjectAction
): SceneObject<TLayerKey> => {
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
    case "moveBy": {
      return {
        ...obj,
        position: PosFns.add(obj.position, action.by),
      };
    }
    case "moveTo": {
      return {
        ...obj,
        position: action.to,
      };
    }
  }
};
