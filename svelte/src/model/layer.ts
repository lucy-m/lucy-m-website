import { p, type Position } from "./position";

export type LayerKey = "bg" | "person" | "speechBubble";
export type SubLayerKey = "outline" | "fill";

export type LayerContent =
  | {
      kind: "image";
      image: HTMLImageElement;
      position: Position;
    }
  | {
      kind: "text";
      text: string;
      position: Position;
    };

export interface Layer {
  content: LayerContent;
  layer: LayerKey;
  subLayer: SubLayerKey;
}

export type ContentByLayer = Record<
  LayerKey,
  Record<SubLayerKey, LayerContent[]>
>;

export const emptyContentByLayer: ContentByLayer = {
  bg: {
    outline: [],
    fill: [],
  },
  person: {
    outline: [],
    fill: [],
  },
  speechBubble: {
    outline: [],
    fill: [],
  },
};

export const addLayer = (
  layer: Layer,
  imagesByLayer: ContentByLayer
): ContentByLayer => {
  return {
    ...imagesByLayer,
    [layer.layer]: {
      ...imagesByLayer[layer.layer],
      [layer.subLayer]: [
        ...imagesByLayer[layer.layer][layer.subLayer],
        layer.content,
      ],
    },
  };
};

const layerOrder: LayerKey[] = ["bg", "person", "speechBubble"];
const sublayerOrder: SubLayerKey[] = ["fill", "outline"];

const layerOrigins: Record<LayerKey, Position> = {
  bg: p(0, 0),
  person: p(1260, 490),
  speechBubble: p(730, 260),
};

export const getLayerContentInOrder = (
  imagesByLayer: ContentByLayer
): LayerContent[] => {
  return layerOrder.reduce<LayerContent[]>((acc, layer) => {
    const mergedSublayerItems: LayerContent[] = sublayerOrder.reduce<
      LayerContent[]
    >((acc, sublayer) => {
      const translatedPositions = imagesByLayer[layer][sublayer].map(
        (content) => {
          const position = p(
            content.position.x + layerOrigins[layer].x,
            content.position.y + layerOrigins[layer].y
          );

          return { ...content, position } as LayerContent;
        }
      );

      return [...acc, ...translatedPositions];
    }, []);

    return [...acc, ...mergedSublayerItems];
  }, []);
};
