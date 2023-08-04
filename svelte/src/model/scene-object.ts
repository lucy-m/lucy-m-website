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

export type SceneObjectAction<TState> =
  | {
      kind: "hide";
    }
  | { kind: "show" }
  | { kind: "moveBy"; by: Position }
  | { kind: "moveTo"; to: Position }
  | { kind: "updateState"; state: TState };

type EmptyState = Record<string, never>;

export type SceneObject<TLayerKey extends string, TState> = {
  id: string;
  position: Position;
  hidden?: boolean;
  layerKey: TLayerKey;
  getLayers: () => ObjectLayerContent[];
  state: TState;
  onInteract?: (
    current: SceneObject<string, TState>
  ) => SceneObjectAction<TState>[];
  onTick?: (
    current: SceneObject<string, TState>
  ) => SceneObjectAction<TState>[];
};

export type SceneObjectStateless<TLayerKey extends string> = SceneObject<
  TLayerKey,
  EmptyState
>;

export const makeSceneObject = <TLayerKey extends string>(
  obj: Omit<SceneObject<TLayerKey, EmptyState>, "id" | "state">
): SceneObject<TLayerKey, EmptyState> => {
  return {
    id: uuid(),
    state: {},
    ...obj,
  };
};

export const makeSceneObjectStateful = <TLayerKey extends string, TState>(
  obj: Omit<SceneObject<TLayerKey, TState>, "id">
): SceneObject<TLayerKey, TState> => {
  return {
    id: uuid(),
    ...obj,
  };
};

export const applySceneObjectAction = <TLayerKey extends string, TState>(
  obj: SceneObject<TLayerKey, TState>,
  action: SceneObjectAction<TState>
): SceneObject<TLayerKey, TState> => {
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
    case "updateState": {
      return {
        ...obj,
        state: action.state,
      };
    }
  }
};
