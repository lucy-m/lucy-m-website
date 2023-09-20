import type { Observable } from "rxjs";
import type { PRNG } from "seedrandom";
import type { ComponentType } from "svelte";
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
    }
  | {
      /** Note, this kind of layer is not affected by object's position */
      kind: "ctxDraw";
      subLayer: SubLayerKey;
      draw: (ctx: CanvasRenderingContext2D) => void;
    };

export type SceneObject = {
  id: string;
  typeName?: string;
  hidden?: boolean;
  layerKey: string;
  events$?: Observable<SceneAction>;
  getPosition: () => Position;
  getLayers: () => ObjectLayerContent[];
  onInteract?: () => SceneAction[] | void;
  onTick?: () => SceneAction[] | void;
  onDestroy?: () => void;
  _getDebugInfo?: () => any;
};

export type ObjectEventHandler = (event: unknown) => void;

export interface SceneType {
  typeName: string;
  getObjects: () => readonly SceneObject[];
  addObject: (obj: SceneObject) => void;
  removeObject: (id: string) => void;
  /** Order of layer drawing, from bottom to top */
  layerOrder: readonly string[];
  onExternalEvent: (event: SceneEvent) => void;
  onObjectEvent?: ObjectEventHandler;
  /** Removes all active subscriptions */
  destroy: () => void;
}

export type SceneSpec = (args: {
  random: PRNG;
  mountSvelteComponent: (cmpt: ComponentType) => void;
}) => (
  images: Record<string, HTMLImageElement>,
  onSceneChange: (newScene: SceneSpec) => void
) => SceneType;

export type SceneAction =
  | {
      kind: "addObject";
      makeObject: () => SceneObject;
    }
  | {
      kind: "changeScene";
      newScene: SceneSpec;
    }
  | {
      kind: "removeObject";
      target: string;
    }
  | { kind: "emitEvent"; event: unknown }
  | {
      /** No-op actions are ignored */
      kind: "noop";
    };

export type SceneActionWithSource = SceneAction & { sourceObjectId: string };

export type SceneEvent =
  | { kind: "interact"; position: Position }
  | { kind: "tick" };

export type SceneEventOrAction = SceneEvent | SceneAction;
