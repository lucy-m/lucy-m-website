import { Observable, from, map, of, switchMap, timer, zip } from "rxjs";
import bg0 from "../assets/scene-intro/background/bg 0.PNG";
import bg1 from "../assets/scene-intro/background/bg 1.PNG";
import bg2 from "../assets/scene-intro/background/bg 2.PNG";
import bg3 from "../assets/scene-intro/background/bg 3.PNG";
import bgOutline from "../assets/scene-intro/background/bg outline.PNG";
import person0 from "../assets/scene-intro/person/person 0.PNG";
import person1 from "../assets/scene-intro/person/person 1.PNG";
import person2 from "../assets/scene-intro/person/person 2.PNG";
import personHead from "../assets/scene-intro/person/person head.PNG";
import personOutline from "../assets/scene-intro/person/person outline.PNG";
import type { ImageLayer, ImageSubLayer, ImageWithLayer } from "../model";

export const loadIntroScene = (): Promise<ImageWithLayer[]> => {
  const loadImage = ([path, layer, subLayer]: [
    string,
    ImageLayer,
    ImageSubLayer
  ]): Promise<ImageWithLayer> => {
    const image = new Image();

    return new Promise<void>((resolve) => {
      image.onload = () => {
        resolve();
      };
      image.src = path;
    }).then(() => ({ image, layer, subLayer }));
  };

  const imagePaths: [string, ImageLayer, ImageSubLayer][] = [
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
  ];

  const promises = imagePaths.map(loadImage);

  return Promise.all(promises);
};

export const throttleImages = (
  images: ImageWithLayer[]
): Observable<ImageWithLayer> => {
  const baseDataSource: Observable<ImageWithLayer> = of(images).pipe(
    switchMap((images) => {
      return zip(from(images), timer(0, 100)).pipe(map(([image]) => image));
    })
  );

  return baseDataSource;
};
