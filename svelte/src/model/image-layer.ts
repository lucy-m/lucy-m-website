import { p, type Position } from "./position";
import type { PositionedImage } from "./positioned-image";

export type ImageLayer = "bg" | "person" | "speechBubble";
export type ImageSubLayer = "outline" | "fill";

export interface ImageWithLayer {
  image: HTMLImageElement;
  layer: ImageLayer;
  subLayer: ImageSubLayer;
}

export type ImagesByLayer = Record<
  ImageLayer,
  Record<ImageSubLayer, HTMLImageElement[]>
>;

export const emptyImagesByLayer: ImagesByLayer = {
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

export const addImage = (
  image: ImageWithLayer,
  imagesByLayer: ImagesByLayer
): ImagesByLayer => {
  return {
    ...imagesByLayer,
    [image.layer]: {
      ...imagesByLayer[image.layer],
      [image.subLayer]: [
        ...imagesByLayer[image.layer][image.subLayer],
        image.image,
      ],
    },
  };
};

const layerOrder: ImageLayer[] = ["bg", "person", "speechBubble"];
const sublayerOrder: ImageSubLayer[] = ["fill", "outline"];

const layerOrigins: Record<ImageLayer, Position> = {
  bg: p(0, 0),
  person: p(1260, 490),
  speechBubble: p(730, 260),
};

export const getImagesInOrder = (
  imagesByLayer: ImagesByLayer
): PositionedImage[] => {
  return layerOrder.reduce<PositionedImage[]>((acc, layer) => {
    const mergedSublayerItems: PositionedImage[] = sublayerOrder
      .reduce<HTMLImageElement[]>((acc, sublayer) => {
        return [...acc, ...imagesByLayer[layer][sublayer]];
      }, [])
      .map((image) => ({
        image,
        position: layerOrigins[layer],
      }));

    return [...acc, ...mergedSublayerItems];
  }, []);
};
