import type { AssetKey } from "./assets";
import { PosFns, type Position } from "./position";
import type { SceneType } from "./scene-types";

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

type LayerByLayerKey = Partial<Record<string, DrawLayer[]>>;

const addLayer = (
  layerKey: string,
  content: DrawLayer,
  imagesByLayer: LayerByLayerKey
): LayerByLayerKey => {
  const newSubLayerEntry: DrawLayer[] = [
    ...(imagesByLayer[layerKey] ?? []),
    content,
  ];

  return {
    ...imagesByLayer,
    [layerKey]: newSubLayerEntry,
  };
};

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
    const mergedSublayerItems: DrawLayer[] = imagesByLayer[layerKey] ?? [];

    return [...acc, ...mergedSublayerItems];
  }, []);
};

export const resolveScene = (
  scene: SceneType,
  images: Record<AssetKey, HTMLImageElement>
): DrawLayer[] => {
  const sceneLayers: [string, DrawLayer][] = scene
    .getObjects()
    .filter((obj) => !obj.hidden)
    .flatMap((obj) => {
      return obj.getLayers().map<[string, DrawLayer]>((objectLayerContent) => {
        return [
          obj.layerKey,
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
    (acc, [layerKey, content]) => addLayer(layerKey, content, acc),
    {}
  );

  return getLayerContentInOrder(scene.layerOrder, byLayerKeys);
};
