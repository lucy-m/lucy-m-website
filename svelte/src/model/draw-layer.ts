import type { AssetKey } from "./assets";
import { PosFns, type Position } from "./position";
import type { SceneType } from "./scene-types";
import type { SubLayerKey } from "./sub-layer-key";

type LayerContent =
  | {
      kind: "image";
      image: HTMLImageElement;
    }
  | {
      kind: "text";
      text: string[];
      maxWidth: number;
    };

export type DrawLayer = {
  content: LayerContent;
  position: Position;
  /** Rotation in degrees around center of object */
  rotation?: number;
};

type LayerByLayerKey<TLayerKey extends string> = Partial<
  Record<TLayerKey, Partial<Record<SubLayerKey, DrawLayer[]>>>
>;

const addLayer = <TLayerKey extends string>(
  layerKey: TLayerKey,
  subLayerKey: SubLayerKey,
  content: DrawLayer,
  imagesByLayer: LayerByLayerKey<TLayerKey>
): LayerByLayerKey<TLayerKey> => {
  const newSubLayerEntry: DrawLayer[] = [
    ...(imagesByLayer[layerKey]?.[subLayerKey] ?? []),
    content,
  ];

  return {
    ...imagesByLayer,
    [layerKey]: {
      ...imagesByLayer[layerKey],
      [subLayerKey]: newSubLayerEntry,
    } as LayerByLayerKey<TLayerKey>,
  };
};

const sublayerOrder: SubLayerKey[] = ["background", "text"];

const getLayerContentInOrder = <TLayerKey extends string>(
  layerOrder: readonly TLayerKey[],
  imagesByLayer: LayerByLayerKey<TLayerKey>
): DrawLayer[] => {
  return layerOrder.reduce<DrawLayer[]>((acc, layerKey) => {
    const mergedSublayerItems: DrawLayer[] = sublayerOrder.reduce<DrawLayer[]>(
      (acc, sublayer) => {
        const items = imagesByLayer[layerKey]?.[sublayer] ?? [];

        return [...acc, ...items];
      },
      []
    );

    return [...acc, ...mergedSublayerItems];
  }, []);
};

export const resolveScene = <TLayerKey extends string>(
  scene: SceneType<TLayerKey>,
  images: Record<AssetKey, HTMLImageElement>
): DrawLayer[] => {
  const sceneLayers: [TLayerKey, SubLayerKey, DrawLayer][] = scene.objects
    .filter((obj) => !obj.hidden)
    .flatMap((obj) => {
      return obj
        .getLayers(obj)
        .map<[TLayerKey, SubLayerKey, DrawLayer]>((objectLayerContent) => {
          return [
            obj.layerKey,
            objectLayerContent.kind === "image"
              ? objectLayerContent.subLayer
              : "background",
            {
              content:
                objectLayerContent.kind === "image"
                  ? {
                      kind: "image",
                      image: images[objectLayerContent.assetKey],
                    }
                  : {
                      kind: "text",
                      maxWidth: objectLayerContent.maxWidth,
                      text: objectLayerContent.text,
                    },
              position: PosFns.add(
                objectLayerContent.position ?? PosFns.zero,
                obj.position
              ),
              rotation:
                objectLayerContent.kind === "image"
                  ? objectLayerContent.rotation
                  : undefined,
            },
          ];
        });
    });

  const byLayerKeys = sceneLayers.reduce<LayerByLayerKey<TLayerKey>>(
    (acc, [layerKey, subLayerKey, content]) =>
      addLayer(layerKey, subLayerKey, content, acc),
    {}
  );

  return getLayerContentInOrder(scene.layerOrder, byLayerKeys);
};
