import {
  PosFns,
  type Position,
  type SceneModel,
  type SubLayerKey,
} from "../model";

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

const imageLayers: [AssetKey, LayerKey, SubLayerKey][] = [
  ["bgOutline", "bg", "outline"],
  ["bg0", "bg", "fill"],
  ["bg1", "bg", "fill"],
  ["bg2", "bg", "fill"],
  ["bg3", "bg", "fill"],
  ["personOutline", "person", "outline"],
  ["person0", "person", "fill"],
  ["person1", "person", "fill"],
  ["person2", "person", "fill"],
  ["personHead", "person", "outline"],
  ["speechBubbleOutline", "speechBubble", "outline"],
  ["speechBubbleFill", "speechBubble", "fill"],
];

const textLayers: [string[], LayerKey, Position][] = [
  [
    [
      "Hello! Thank you for",
      "visiting my little",
      "corner of the world.",
      "There's not much to",
      "see here yet but I'm",
      "working on it (promise).",
    ],
    "speechBubble",
    PosFns.new(80, 110),
  ],
];

export const introScene: SceneModel<LayerKey, AssetKey> = {
  imagePaths,
  imageLayers,
  textLayers,
  layerOrder,
  layerOrigins,
};
