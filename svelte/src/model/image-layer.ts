export type ImageLayer = "bg" | "person";
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

const layerOrder: ImageLayer[] = ["bg", "person"];
const sublayerOrder: ImageSubLayer[] = ["fill", "outline"];

export const getImagesInOrder = (
  imagesByLayer: ImagesByLayer
): HTMLImageElement[] => {
  return layerOrder.reduce<HTMLImageElement[]>((acc, layer) => {
    const mergedSublayerItems = sublayerOrder.reduce<HTMLImageElement[]>(
      (acc, sublayer) => {
        return [...acc, ...imagesByLayer[layer][sublayer]];
      },
      []
    );

    return [...acc, ...mergedSublayerItems];
  }, []);
};
