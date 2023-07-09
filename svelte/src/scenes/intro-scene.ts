import { PosFns, type GameObject, type SceneType } from "../model";
import type { AssetKey } from "../model/assets";
import { generatePointsInShape, type Shape } from "../model/shape";

type LayerKey = "bg" | "person" | "speechBubble" | "trees";

const layerOrder: LayerKey[] = ["bg", "trees", "person", "speechBubble"];

const randomTree = (): AssetKey => {
  const r = Math.random() * 3;

  if (r < 1) {
    return "tree1";
  } else if (r < 2) {
    return "tree2";
  } else {
    return "tree3";
  }
};

const makeTrees = (target: number, shape: Shape): GameObject<LayerKey>[] => {
  return generatePointsInShape(target, shape)
    .sort((a, b) => a.y - b.y)
    .map<GameObject<LayerKey>>((position) => ({
      position,
      layerKey: "trees",
      getLayers: () => [
        {
          kind: "image",
          assetKey: randomTree(),
          subLayer: "fill",
        },
      ],
    }));
};

const objects: GameObject<LayerKey>[] = [
  {
    position: PosFns.zero,
    layerKey: "bg",
    getLayers: () => [
      { kind: "image", assetKey: "bgOutline", subLayer: "outline" },
      { kind: "image", assetKey: "bg0", subLayer: "fill" },
      { kind: "image", assetKey: "bg1", subLayer: "fill" },
      { kind: "image", assetKey: "bg2", subLayer: "fill" },
      { kind: "image", assetKey: "bg3", subLayer: "fill" },
    ],
  },
  // ...makeTrees(20, [
  //   PosFns.new(0, 300),
  //   PosFns.new(500, 250),
  //   PosFns.new(750, 350),
  //   PosFns.new(100, 500),
  // ]),
  // ...makeTrees(20, [
  //   PosFns.new(881, 231),
  //   PosFns.new(1569, 196),
  //   PosFns.new(1837, 209),
  //   PosFns.new(1829, 361),
  //   PosFns.new(1309, 333),
  // ]),
  {
    layerKey: "person",
    position: PosFns.new(1260, 490),
    getLayers: () => [
      { kind: "image", assetKey: "personOutline", subLayer: "outline" },
      { kind: "image", assetKey: "person0", subLayer: "fill" },
      { kind: "image", assetKey: "person1", subLayer: "fill" },
      { kind: "image", assetKey: "person2", subLayer: "fill" },
      { kind: "image", assetKey: "personHead", subLayer: "outline" },
    ],
  },
  {
    layerKey: "speechBubble",
    position: PosFns.new(730, 260),
    getLayers: () => [
      { kind: "image", assetKey: "speechBubbleOutline", subLayer: "outline" },
      { kind: "image", assetKey: "speechBubbleFill", subLayer: "fill" },
      {
        kind: "text",
        text: [
          "Hello! Thank you for visiting my little corner of the world.",
          "There's not much to see here yet but I'm working on it (promise).",
        ],
        position: PosFns.new(80, 90),
        maxWidth: 430,
      },
    ],
  },
];

export const introScene: SceneType<LayerKey> = {
  objects,
  layerOrder,
};
