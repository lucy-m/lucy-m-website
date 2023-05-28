import type { Layer, LayerContent, SubLayerKey } from "./layer";
import { PosFns, type Position } from "./position";

type LayerContentSpec<TAssetKey extends string> =
  | {
      kind: "text";
      text: string[];
      position: Position;
      maxWidth: number;
    }
  | {
      kind: "image";
      assetKey: TAssetKey;
      subLayer: SubLayerKey;
    };

export interface SceneSpec<TLayerKey extends string, TAssetKey extends string> {
  layerSpecs: [TLayerKey, LayerContentSpec<TAssetKey>[]][];
  layerOrder: TLayerKey[];
  layerOrigins: Record<TLayerKey, Position>;
  imagePaths: Record<TAssetKey, string>;
}

export type LoadedScene<
  TLayerKey extends string,
  TAssetKey extends string
> = Omit<SceneSpec<TLayerKey, TAssetKey>, "imagePaths"> & {
  images: Record<TAssetKey, HTMLImageElement>;
};

export type ResolvedScene<TLayerKey extends string> = Omit<
  LoadedScene<TLayerKey, string>,
  "layerSpecs" | "images"
> & {
  layers: Layer<TLayerKey>[];
};

const loadImage = (absPath: string): Promise<HTMLImageElement> => {
  const image = new Image();
  return new Promise<void>((resolve) => {
    image.onload = () => {
      resolve();
    };
    image.src = absPath;
  }).then(() => image);
};

export const loadScene = <TLayerKey extends string, TAssetKey extends string>(
  source: SceneSpec<TLayerKey, TAssetKey>
): Promise<LoadedScene<TLayerKey, TAssetKey>> => {
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
      return {
        images,
        layerSpecs: source.layerSpecs,
        layerOrder: source.layerOrder,
        layerOrigins: source.layerOrigins,
      };
    });
};

export const resolveScene = <
  TLayerKey extends string,
  TAssetKey extends string
>(
  source: LoadedScene<TLayerKey, TAssetKey>
): ResolvedScene<TLayerKey> => {
  const layers: Layer<TLayerKey>[] = source.layerSpecs.flatMap(
    ([layer, contentSpecs]) => {
      const contents: LayerContent[] = contentSpecs.map((contentSpec) => {
        if (contentSpec.kind == "image") {
          return {
            kind: "image",
            image: source.images[contentSpec.assetKey],
            position: PosFns.zero,
            subLayer: contentSpec.subLayer,
          };
        } else {
          return {
            kind: "text",
            position: contentSpec.position,
            text: contentSpec.text,
            maxWidth: contentSpec.maxWidth,
          };
        }
      });

      return contents.map((content) => ({ content, layer }));
    }
  );

  return {
    layers,
    layerOrder: source.layerOrder,
    layerOrigins: source.layerOrigins,
  };
};
