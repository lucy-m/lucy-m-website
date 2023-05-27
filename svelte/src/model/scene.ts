import type { Layer, SubLayerKey } from "./layer";
import { PosFns, type Position } from "./position";

export interface SceneModel<
  TLayerKey extends string,
  TAssetKey extends string
> {
  imageLayers: [TAssetKey, TLayerKey, SubLayerKey][];
  textLayers: [string[], TLayerKey, Position][];
  layerOrder: TLayerKey[];
  layerOrigins: Record<TLayerKey, Position>;
  imagePaths: Record<TAssetKey, string>;
}

export type LoadedScene<
  TLayerKey extends string,
  TAssetKey extends string
> = Omit<
  SceneModel<TLayerKey, TAssetKey>,
  "imageLayers" | "textLayers" | "imagePaths"
> & {
  layers: Layer<TLayerKey>[];
  images: Record<TAssetKey, HTMLImageElement>;
};

const loadImage = (path: string): Promise<HTMLImageElement> => {
  const image = new Image();

  return new Promise<void>((resolve) => {
    image.onload = () => {
      resolve();
    };
    image.src = path;
  }).then(() => image);
};

export const loadScene = <TLayerKey extends string, TAssetKey extends string>(
  source: SceneModel<TLayerKey, TAssetKey>
): Promise<LoadedScene<TLayerKey, TAssetKey>> => {
  const textLayers: Layer<TLayerKey>[] = source.textLayers.map(
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

  const promises = Object.entries<string>(source.imagePaths).map(
    ([assetKey, path]) =>
      loadImage(path).then((image) => [assetKey, image] as const)
  );

  return Promise.all(promises)
    .then(
      (entries) =>
        Object.fromEntries(entries) as Record<TAssetKey, HTMLImageElement>
    )
    .then((images) => {
      const imageLayers: Layer<TLayerKey>[] = source.imageLayers.map(
        ([assetKey, layer, subLayer]) => ({
          content: {
            kind: "image",
            position: PosFns.new(0, 0),
            image: images[assetKey],
          },
          layer,
          subLayer,
        })
      );

      const layers: Layer<TLayerKey>[] = [...imageLayers, ...textLayers];

      return {
        images,
        layers,
        layerOrder: source.layerOrder,
        layerOrigins: source.layerOrigins,
      };
    });
};
