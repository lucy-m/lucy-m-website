import type { Observable } from "rxjs";
import type { PRNG } from "seedrandom";
import type { ComponentProps, ComponentType, SvelteComponent } from "svelte";
import { z } from "zod";
import type { AssetKey } from "./assets";
import type { Position } from "./position";
import { userInteractionSchema } from "./user-interactions";

export type EmptyState = Record<string, never>;

export type ObjectLayerContent = Readonly<
  (
    | {
        kind: "text";
        text: string[];
        position: Position;
        maxWidth: number;
      }
    | {
        kind: "image";
        assetKey: AssetKey;
        position?: Position;
        rotation?: number;
      }
    | {
        /** Note, this kind of layer is not affected by object's position */
        kind: "ctxDraw";
        draw: (ctx: CanvasRenderingContext2D) => void;
      }
  ) & {
    shadow?: {
      color: string;
      blur: number;
    };
  }
>;

export type SceneObject = {
  id: string;
  typeName?: string;
  hidden?: boolean;
  layerKey: string;
  events$?: Observable<SceneAction>;
  getPosition: () => Position;
  getLayers: () => ObjectLayerContent[];
  onAddedToScene?: () => SceneAction[] | void;
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

export type SvelteComponentMounter = <T extends SvelteComponent>(
  cmpt: ComponentType<T>,
  props: Omit<ComponentProps<T>, "unmountSelf">
) => void;

export type SceneSpec = (args: {
  random: PRNG;
  mountSvelteComponent: SvelteComponentMounter;
}) => (
  images: Record<string, ImageBitmap>,
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

export const sceneEventInteract = z.object({
  kind: z.literal("interact"),
  interaction: userInteractionSchema,
});

export type SceneEventInteract = z.infer<typeof sceneEventInteract>;

export type SceneEvent = SceneEventInteract | { kind: "tick" };

export type SceneEventOrAction = SceneEvent | SceneAction;
