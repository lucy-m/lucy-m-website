import { Observable, from, map, of, switchMap, timer, zip } from "rxjs";
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
import {
  p,
  type Layer,
  type LayerKey,
  type Position,
  type SubLayerKey,
} from "../model";

export const loadIntroScene = (): Promise<Layer[]> => {
  const loadImage = ([path, layer, subLayer]: [
    string,
    LayerKey,
    SubLayerKey
  ]): Promise<Layer> => {
    const image = new Image();

    return new Promise<void>((resolve) => {
      image.onload = () => {
        resolve();
      };
      image.src = path;
    }).then(() => ({
      content: { kind: "image", image, position: p(0, 0) },
      layer,
      subLayer,
    }));
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

  const textLayers: Layer[] = texts.map(([text, layer, position]) => ({
    content: {
      kind: "text",
      text,
      position,
    },
    layer,
    subLayer: "outline",
  }));

  const promises = imagePaths.map(loadImage);

  return Promise.all(promises).then((layers) => {
    return [...layers, ...textLayers];
  });
};

export const throttleLayers = (images: Layer[]): Observable<Layer> => {
  const baseDataSource: Observable<Layer> = of(images).pipe(
    switchMap((images) => {
      return zip(from(images), timer(0, 100)).pipe(map(([image]) => image));
    })
  );

  return baseDataSource;
};
