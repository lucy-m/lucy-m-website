import { PosFns, type Position } from "./position";

export type SubLayerKey = "outline" | "fill";

export type LayerContent =
  | {
      kind: "image";
      image: HTMLImageElement;
      position: Position;
    }
  | {
      kind: "text";
      text: string[];
      position: Position;
    };

export interface Layer<TLayerKey> {
  content: LayerContent;
  layer: TLayerKey;
  subLayer: SubLayerKey;
}

export type ContentByLayer<TLayerKey extends string> = Partial<
  Record<TLayerKey, Partial<Record<SubLayerKey, LayerContent[]>>>
>;

export const addLayer = <TLayerKey extends string>(
  layer: Layer<TLayerKey>,
  imagesByLayer: ContentByLayer<TLayerKey>
): ContentByLayer<TLayerKey> => {
  return {
    ...imagesByLayer,
    [layer.layer]: {
      ...imagesByLayer[layer.layer],
      [layer.subLayer]: [
        ...(imagesByLayer[layer.layer]?.[layer.subLayer] ?? []),
        layer.content,
      ],
    },
  };
};

const sublayerOrder: SubLayerKey[] = ["fill", "outline"];

export const getLayerContentInOrder = <TLayerKey extends string>(
  layerOrder: TLayerKey[],
  layerOrigins: Record<TLayerKey, Position>,
  imagesByLayer: ContentByLayer<TLayerKey>
): LayerContent[] => {
  return layerOrder.reduce<LayerContent[]>((acc, layer) => {
    const mergedSublayerItems: LayerContent[] = sublayerOrder.reduce<
      LayerContent[]
    >((acc, sublayer) => {
      const translatedPositions =
        imagesByLayer[layer]?.[sublayer]?.map((content) => {
          const position = PosFns.add(content.position, layerOrigins[layer]);

          return { ...content, position } as LayerContent;
        }) ?? [];

      return [...acc, ...translatedPositions];
    }, []);

    return [...acc, ...mergedSublayerItems];
  }, []);
};
