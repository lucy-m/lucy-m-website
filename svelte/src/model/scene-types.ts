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

export type SceneObject = {
  id: string;
  rotation?: number;
  typeName?: string;
  hidden?: boolean;
  layerKey: string;
  events$?: Observable<any>;
  getPosition: () => Position;
  getLayers: () => ObjectLayerContent[];
  onInteract?: () => SceneAction[];
  onTick?: () => SceneAction[];
  _getDebugInfo?: () => any;
};

export interface SceneType {
  typeName: string;
  getObjects: () => readonly SceneObject[];
  addObject: (obj: SceneObject) => void;
  removeObject: (id: string) => void;
  /** Order of layer drawing, from bottom to top */
  layerOrder: readonly string[];
  events: Observable<SceneEvent | SceneAction>;
}

export type SceneAction =
  | {
      kind: "addObject";
      makeObject: () => SceneObject;
    }
  | {
      kind: "changeScene";
      makeScene: () => SceneType;
    }
  | {
      kind: "removeObject";
      target: string;
    };

export type SceneEvent =
  | { kind: "interact"; position: Position }
  | { kind: "tick" };

export type SceneEventOrAction = SceneEvent | SceneAction;
