import bg0 from "../assets/scene-intro/background/bg 0.PNG";
import bg1 from "../assets/scene-intro/background/bg 1.PNG";
import bg2 from "../assets/scene-intro/background/bg 2.PNG";
import bg3 from "../assets/scene-intro/background/bg 3.PNG";
import bgOutline from "../assets/scene-intro/background/bg outline.PNG";
import person0 from "../assets/scene-intro/person-sitting/person 0.PNG";
import person1 from "../assets/scene-intro/person-sitting/person 1.PNG";
import person2 from "../assets/scene-intro/person-sitting/person 2.PNG";
import personHead from "../assets/scene-intro/person-sitting/person head.PNG";
import personOutline from "../assets/scene-intro/person-sitting/person outline.PNG";
import speechBubbleFill from "../assets/scene-intro/speech-bubble/fill.PNG";
import speechBubbleOutline from "../assets/scene-intro/speech-bubble/outline.PNG";
import { p, type Position, type SceneModel, type SubLayerKey } from "../model";

type LayerKey = "bg" | "person" | "speechBubble";

const layerOrder: LayerKey[] = ["bg", "person", "speechBubble"];

const layerOrigins: Record<LayerKey, Position> = {
  bg: p(0, 0),
  person: p(1260, 490),
  speechBubble: p(730, 260),
};

const imagePaths: [string, LayerKey, SubLayerKey][] = [
  [bgOutline, "bg", "outline"],
  [bg0, "bg", "fill"],
  [bg1, "bg", "fill"],
  [bg2, "bg", "fill"],
  [bg3, "bg", "fill"],
  [personOutline, "person", "outline"],
  [person0, "person", "fill"],
  [person1, "person", "fill"],
  [person2, "person", "fill"],
  [personHead, "person", "outline"],
  [speechBubbleOutline, "speechBubble", "outline"],
  [speechBubbleFill, "speechBubble", "fill"],
];

const texts: [string, LayerKey, Position][] = [
  ["Hello world", "speechBubble", p(100, 100)],
];

export const introScene: SceneModel<LayerKey> = {
  imagePaths,
  texts,
  layerOrder,
  layerOrigins,
};
