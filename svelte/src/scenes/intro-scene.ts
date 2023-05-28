import { PosFns, type Position, type SceneSpec } from "../model";

type LayerKey = "bg" | "person" | "speechBubble";

const layerOrder: LayerKey[] = ["bg", "person", "speechBubble"];

const layerOrigins: Record<LayerKey, Position> = {
  bg: PosFns.new(0, 0),
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
};

type AssetKey = keyof typeof imagePaths;

const layerSpecs: SceneSpec<LayerKey, AssetKey>["layerSpecs"] = [
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
          "Hello! Thank you for",
          "visiting my little",
          "corner of the world.",
          "There's not much to",
          "see here yet but I'm",
          "working on it (promise).",
        ],
        position: PosFns.new(80, 110),
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
