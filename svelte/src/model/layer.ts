import { PosFns, type Position } from "./position";

export type SubLayerKey = "outline" | "fill";

export type LayerContent =
  | {
      kind: "image";
      image: HTMLImageElement;
      subLayer: SubLayerKey;
    }
  | {
      kind: "text";
      text: string[];
      maxWidth: number;
    };

export interface Layer<TLayerKey> {
  position: Position;
  content: LayerContent;
  layerKey: TLayerKey;
}

export type UnkeyedLayer = Omit<Layer<string>, "layer">;

export type LayerByLayerKey<TLayerKey extends string> = Partial<
  Record<TLayerKey, Partial<Record<SubLayerKey, UnkeyedLayer[]>>>
>;

export const addLayer = <TLayerKey extends string>(
  layer: Layer<TLayerKey>,
  imagesByLayer: LayerByLayerKey<TLayerKey>
): LayerByLayerKey<TLayerKey> => {
  const subLayer: SubLayerKey =
    layer.content.kind === "image" ? layer.content.subLayer : "outline";

  const newSubLayerEntry: UnkeyedLayer[] = [
    ...(imagesByLayer[layer.layerKey]?.[subLayer] ?? []),
    layer,
  ];

  return {
    ...imagesByLayer,
    [layer.layerKey]: {
      ...imagesByLayer[layer.layerKey],
      [subLayer]: newSubLayerEntry,
    } as LayerByLayerKey<TLayerKey>,
  };
};

const sublayerOrder: SubLayerKey[] = ["fill", "outline"];

export const getLayerContentInOrder = <TLayerKey extends string>(
  layerOrder: TLayerKey[],
  layerOrigins: Record<TLayerKey, Position>,
  imagesByLayer: LayerByLayerKey<TLayerKey>
): UnkeyedLayer[] => {
  return layerOrder.reduce<UnkeyedLayer[]>((acc, layerKey) => {
    const mergedSublayerItems: UnkeyedLayer[] = sublayerOrder.reduce<
      UnkeyedLayer[]
    >((acc, sublayer) => {
      const translatedPositions =
        imagesByLayer[layerKey]?.[sublayer]?.map((layer) => {
          const position = PosFns.add(layer.position, layerOrigins[layerKey]);

          return { ...layer, position } as UnkeyedLayer;
        }) ?? [];

      return [...acc, ...translatedPositions];
    }, []);

    return [...acc, ...mergedSublayerItems];
  }, []);
};
