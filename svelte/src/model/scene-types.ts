import type { Observable } from "rxjs";
import type { AssetKey } from "./assets";
import type { Position } from "./position";
import type { SubLayerKey } from "./sub-layer-key";

export type EmptyState = Record<string, never>;

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
      rotation?: number;
    };

export type SceneObjectTypeNames = "small-house" | "cruising-bird" | "feather";

export type SceneObject<TLayerKey extends string, TState> = {
  id: string;
  position: Position;
  rotation?: number;
  typeName?: SceneObjectTypeNames;
  hidden?: boolean;
  layerKey: TLayerKey;
  state: TState;
  getLayers: (current: SceneObject<string, TState>) => ObjectLayerContent[];
  onInteract?: (
    current: SceneObject<string, TState>
  ) => SceneObjectAction<TLayerKey, TState>[];
  onTick?: (
    current: SceneObject<string, TState>
  ) => SceneObjectAction<TLayerKey, TState>[];
};

export type SceneObjectStateless<TLayerKey extends string> = SceneObject<
  TLayerKey,
  EmptyState
>;

export type SceneObjectAction<TLayerKey extends string, TState = EmptyState> =
  | ((
      | {
          kind: "hide";
        }
      | { kind: "show" }
      | { kind: "moveBy"; by: Position }
      | { kind: "moveTo"; to: Position }
      | { kind: "removeObject" }
    ) & { target?: string })
  | { kind: "updateState"; state: Partial<TState> }
  | { kind: "sceneAction"; action: SceneAction<TLayerKey> };

export interface SceneType<TLayerKey extends string, TSceneState> {
  typeName: string;
  objects: readonly SceneObject<TLayerKey, unknown>[];
  /** Order of layer drawing, from bottom to top */
  layerOrder: readonly TLayerKey[];
  events: Observable<SceneEvent | SceneAction<TLayerKey>>;
  state: TSceneState;
  getWorldStateObjects: (
    state: TSceneState
  ) => readonly SceneObjectStateless<TLayerKey>[];
}

export type SceneTypeStateless<TLayerKey extends string> = SceneType<
  TLayerKey,
  EmptyState
>;

export type SceneObjectActionApplyResult<TLayerKey extends string, TState> =
  | { kind: "update"; object: SceneObject<TLayerKey, TState> }
  | { kind: "removeObject" }
  | { kind: "sceneAction"; action: SceneAction<TLayerKey> };

export type SceneAction<TLayerKey extends string> =
  | {
      kind: "addObject";
      makeObject: () => SceneObject<TLayerKey, unknown>;
    }
  | {
      kind: "changeScene";
      makeScene: () => SceneType<string, unknown>;
    };

export type SceneEvent =
  | { kind: "interact"; position: Position }
  | { kind: "tick" };

export type SceneEventOrAction<TLayerKey extends string> =
  | SceneEvent
  | SceneAction<TLayerKey>;
