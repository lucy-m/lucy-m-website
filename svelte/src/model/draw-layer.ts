import type { AssetKey } from "./assets";
import { PosFns, type Position } from "./position";
import type { SceneType } from "./scene-types";
import type { SubLayerKey } from "./sub-layer-key";

type LayerContent =
  | {
      kind: "image";
      image: HTMLImageElement;
      /** Rotation in degrees around center of object */
      rotation?: number;
    }
  | {
      kind: "text";
      text: string[];
      maxWidth: number;
    }
  | {
      kind: "ctxDraw";
      draw: (ctx: CanvasRenderingContext2D) => void;
    };

export type DrawLayer = {
  content: LayerContent;
  position: Position;
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
  const undrawnLayers = Object.keys(imagesByLayer).filter(
    (layer) => !layerOrder.includes(layer)
  );

  if (undrawnLayers.length > 0) {
    console.warn("There are undrawn layers", undrawnLayers.join(", "));
  }

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
                      rotation: objectLayerContent.rotation,
                    }
                  : objectLayerContent.kind === "text"
                  ? {
                      kind: "text",
                      maxWidth: objectLayerContent.maxWidth,
                      text: objectLayerContent.text,
                    }
                  : {
                      kind: "ctxDraw",
                      draw: objectLayerContent.draw,
                    },
              position: PosFns.add(
                ("position" in objectLayerContent
                  ? objectLayerContent.position
                  : undefined) ?? PosFns.zero,
                obj.getPosition()
              ),
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
