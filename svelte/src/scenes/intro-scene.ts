import {
  PosFns,
  type LayerSpec,
  type Position,
  type SceneSpec,
} from "../model";
import { generatePointsInShape, type Shape } from "../model/shape";

type LayerKey = "bg" | "person" | "speechBubble" | "trees";

const layerOrder: LayerKey[] = ["bg", "trees", "person", "speechBubble"];

const layerOrigins: Record<LayerKey, Position> = {
  bg: PosFns.zero,
  trees: PosFns.zero,
  person: PosFns.new(1260, 490),
  speechBubble: PosFns.new(730, 260),
};

const imagePaths = {
  bgOutline: "/assets/scene-intro/background/bg outline.PNG",
  bg0: "/assets/scene-intro/background/bg 0.PNG",
  bg1: "/assets/scene-intro/background/bg 1.PNG",
  bg2: "/assets/scene-intro/background/bg 2.PNG",
  bg3: "/assets/scene-intro/background/bg 3.PNG",
  personOutline: "/assets/scene-intro/person-sitting/person outline.PNG",
  person0: "/assets/scene-intro/person-sitting/person 0.PNG",
  person1: "/assets/scene-intro/person-sitting/person 1.PNG",
  person2: "/assets/scene-intro/person-sitting/person 2.PNG",
  personHead: "/assets/scene-intro/person-sitting/person head.PNG",
  speechBubbleOutline: "/assets/scene-intro/speech-bubble/outline.PNG",
  speechBubbleFill: "/assets/scene-intro/speech-bubble/fill.PNG",
  tree1: "/assets/scene-intro/trees/tree1.PNG",
  tree2: "/assets/scene-intro/trees/tree2.PNG",
  tree3: "/assets/scene-intro/trees/tree3.PNG",
};

type AssetKey = keyof typeof imagePaths;

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

const makeTreeLayer = (
  target: number,
  shape: Shape
): LayerSpec<LayerKey, AssetKey> => {
  return [
    "trees",
    generatePointsInShape(target, shape)
      .sort((a, b) => a.y - b.y)
      .map((position) => ({
        kind: "image",
        assetKey: randomTree(),
        subLayer: "fill",
        position,
      })),
  ];
};

const layerSpecs: LayerSpec<LayerKey, AssetKey>[] = [
  [
    "bg",
    [
      { kind: "image", assetKey: "bgOutline", subLayer: "outline" },
      { kind: "image", assetKey: "bg0", subLayer: "fill" },
      { kind: "image", assetKey: "bg1", subLayer: "fill" },
      { kind: "image", assetKey: "bg2", subLayer: "fill" },
      { kind: "image", assetKey: "bg3", subLayer: "fill" },
    ],
  ],
  makeTreeLayer(20, [
    PosFns.new(0, 300),
    PosFns.new(500, 250),
    PosFns.new(750, 350),
    PosFns.new(100, 500),
  ]),
  makeTreeLayer(20, [
    PosFns.new(881, 231),
    PosFns.new(1569, 196),
    PosFns.new(1837, 209),
    PosFns.new(1829, 361),
    PosFns.new(1309, 333),
  ]),
  [
    "person",
    [
      { kind: "image", assetKey: "personOutline", subLayer: "outline" },
      { kind: "image", assetKey: "person0", subLayer: "fill" },
      { kind: "image", assetKey: "person1", subLayer: "fill" },
      { kind: "image", assetKey: "person2", subLayer: "fill" },
      { kind: "image", assetKey: "personHead", subLayer: "outline" },
    ],
  ],
  [
    "speechBubble",
    [
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
  ],
];

export const introScene: SceneSpec<LayerKey, AssetKey> = {
  imagePaths,
  layerSpecs,
  layerOrder,
  layerOrigins,
};
