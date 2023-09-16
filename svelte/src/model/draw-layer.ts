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

type LayerByLayerKey = Partial<
  Record<string, Partial<Record<SubLayerKey, DrawLayer[]>>>
>;

const addLayer = (
  layerKey: string,
  subLayerKey: SubLayerKey,
  content: DrawLayer,
  imagesByLayer: LayerByLayerKey
): LayerByLayerKey => {
  const newSubLayerEntry: DrawLayer[] = [
    ...(imagesByLayer[layerKey]?.[subLayerKey] ?? []),
    content,
  ];

  return {
    ...imagesByLayer,
    [layerKey]: {
      ...imagesByLayer[layerKey],
      [subLayerKey]: newSubLayerEntry,
    } as LayerByLayerKey,
  };
};

const sublayerOrder: SubLayerKey[] = ["background", "text"];

const getLayerContentInOrder = (
  layerOrder: readonly string[],
  imagesByLayer: LayerByLayerKey
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

export const resolveScene = (
  scene: SceneType,
  images: Record<AssetKey, HTMLImageElement>
): DrawLayer[] => {
  const sceneLayers: [string, SubLayerKey, DrawLayer][] = scene
    .getObjects()
    .filter((obj) => !obj.hidden)
    .flatMap((obj) => {
      return obj
        .getLayers()
        .map<[string, SubLayerKey, DrawLayer]>((objectLayerContent) => {
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
                obj.getPosition()
              ),
              rotation:
                objectLayerContent.kind === "image"
                  ? objectLayerContent.rotation
                  : undefined,
            },
          ];
        });
    });

  const byLayerKeys = sceneLayers.reduce<LayerByLayerKey>(
    (acc, [layerKey, subLayerKey, content]) =>
      addLayer(layerKey, subLayerKey, content, acc),
    {}
  );

  return getLayerContentInOrder(scene.layerOrder, byLayerKeys);
};
