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

export type SceneObject<TLayerKey extends string> = {
  id: string;
  rotation?: number;
  typeName?: SceneObjectTypeNames;
  hidden?: boolean;
  layerKey: TLayerKey;
  getPosition: () => Position;
  getLayers: () => ObjectLayerContent[];
  onInteract?: () => SceneObjectAction<TLayerKey>[];
  onTick?: () => SceneObjectAction<TLayerKey>[];
};

export type SceneObjectStateless<TLayerKey extends string> =
  SceneObject<TLayerKey>;

export type SceneObjectAction<TLayerKey extends string> =
  | ((
      | {
          kind: "hide";
        }
      | { kind: "show" }
      | { kind: "removeObject" }
    ) & { target?: string })
  | { kind: "sceneAction"; action: SceneAction<TLayerKey> };

export interface SceneType<TLayerKey extends string> {
  typeName: string;
  objects: readonly SceneObject<TLayerKey>[];
  /** Order of layer drawing, from bottom to top */
  layerOrder: readonly TLayerKey[];
  events: Observable<SceneEvent | SceneAction<TLayerKey>>;
}

export type SceneObjectActionApplyResult<TLayerKey extends string> =
  | { kind: "update"; object: SceneObject<TLayerKey> }
  | { kind: "removeObject" }
  | { kind: "sceneAction"; action: SceneAction<TLayerKey> };

export type SceneAction<TLayerKey extends string> =
  | {
      kind: "addObject";
      makeObject: () => SceneObject<TLayerKey>;
    }
  | {
      kind: "changeScene";
      makeScene: () => SceneType<string>;
    };

export type SceneEvent =
  | { kind: "interact"; position: Position }
  | { kind: "tick" };

export type SceneEventOrAction<TLayerKey extends string> =
  | SceneEvent
  | SceneAction<TLayerKey>;
