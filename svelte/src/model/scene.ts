import type { Layer, SubLayerKey } from "./layer";
import { PosFns, type Position } from "./position";

export interface SceneModel<TLayerKey extends string> {
  imagePaths: [string, TLayerKey, SubLayerKey][];
  texts: [string[], TLayerKey, Position][];
  layerOrder: TLayerKey[];
  layerOrigins: Record<TLayerKey, Position>;
}

export type LoadedScene<TLayerKey extends string> = Omit<
  SceneModel<TLayerKey>,
  "imagePaths" | "texts"
> & {
  layers: Layer<TLayerKey>[];
};

const loadImage = <TLayerKey extends string>([path, layer, subLayer]: [
  string,
  TLayerKey,
  SubLayerKey
]): Promise<Layer<TLayerKey>> => {
  const image = new Image();

  return new Promise<void>((resolve) => {
    image.onload = () => {
      resolve();
    };
    image.src = path;
  }).then(() => ({
    content: { kind: "image", image, position: PosFns.new(0, 0) },
    layer,
    subLayer,
  }));
};

export const loadScene = <TLayerKey extends string>(
  source: SceneModel<TLayerKey>
): Promise<LoadedScene<TLayerKey>> => {
  const textLayers: Layer<TLayerKey>[] = source.texts.map(
    ([text, layer, position]) => ({
      content: {
        kind: "text",
        text,
        position,
      },
      layer,
      subLayer: "outline",
    })
  );

  const promises = source.imagePaths.map(loadImage);

  return Promise.all(promises).then((layers) => ({
    layers: [...layers, ...textLayers],
    layerOrder: source.layerOrder,
    layerOrigins: source.layerOrigins,
  }));
};
