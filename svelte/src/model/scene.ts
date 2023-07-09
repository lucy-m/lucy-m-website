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

export type GameObject<TLayerKey extends string> = {
  position: Position;
  layerKey: TLayerKey;
  getLayers: () => ObjectLayerContent[];
};

export interface SceneType<TLayerKey extends string> {
  objects: GameObject<TLayerKey>[];
  layerOrder: TLayerKey[];
}
