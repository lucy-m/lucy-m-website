import type { Layer, SubLayerKey } from "./layer";
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
      position?: Position;
    };

export type LayerSpec<TLayerKey extends string, TAssetKey extends string> = [
  TLayerKey,
  LayerContentSpec<TAssetKey>[]
];

export interface SceneSpec<TLayerKey extends string, TAssetKey extends string> {
  layerSpecs: LayerSpec<TLayerKey, TAssetKey>[];
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
    ([layerKey, contentSpecs]) => {
      return contentSpecs.map<Layer<TLayerKey>>((contentSpec) => {
        if (contentSpec.kind == "image") {
          return {
            content: {
              kind: "image",
              image: source.images[contentSpec.assetKey],
              subLayer: contentSpec.subLayer,
            },
            layerKey,
            position: contentSpec.position ?? PosFns.zero,
          };
        } else {
          return {
            content: {
              kind: "text",
              text: contentSpec.text,
              maxWidth: contentSpec.maxWidth,
            },
            position: contentSpec.position,
            layerKey,
          };
        }
      });
    }
  );

  return {
    layers,
    layerOrder: source.layerOrder,
    layerOrigins: source.layerOrigins,
  };
};
