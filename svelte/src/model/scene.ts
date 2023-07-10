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

export type SceneObject<TLayerKey extends string> = {
  position: Position;
  hidden: boolean;
  layerKey: TLayerKey;
  getLayers: () => ObjectLayerContent[];
};

const defaultSceneObjectValues = {
  hidden: false,
};

type ValidTypes = SceneObject<string> extends typeof defaultSceneObjectValues
  ? true
  : false;

const isValidType: ValidTypes = true;

export const makeSceneObject = <TLayerKey extends string>(
  obj: Omit<SceneObject<TLayerKey>, keyof typeof defaultSceneObjectValues> &
    Partial<typeof defaultSceneObjectValues>
): SceneObject<TLayerKey> => {
  return {
    ...defaultSceneObjectValues,
    ...obj,
  };
};

export interface SceneType<TLayerKey extends string> {
  objects: SceneObject<TLayerKey>[];
  layerOrder: TLayerKey[];
}
