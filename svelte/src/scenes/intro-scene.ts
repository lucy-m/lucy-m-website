import { Observable, from, map, of, switchMap, timer, zip } from "rxjs";
import bg0 from "../assets/scene-intro/background/bg 0.PNG";
import bg1 from "../assets/scene-intro/background/bg 1.PNG";
import bg2 from "../assets/scene-intro/background/bg 2.PNG";
import bg3 from "../assets/scene-intro/background/bg 3.PNG";
import bgOutline from "../assets/scene-intro/background/bg outline.PNG";
import person0 from "../assets/scene-intro/person/person 0.PNG";
import person1 from "../assets/scene-intro/person/person 1.PNG";
import person2 from "../assets/scene-intro/person/person 2.PNG";
import personOutline from "../assets/scene-intro/person/person outline.PNG";

export type ImageLayer = "bg" | "person";

export type ImageType = "outline" | "fill";

export interface ImageWithLayer {
  image: HTMLImageElement;
  layer: ImageLayer;
  type: ImageType;
}

export const loadIntroScene = (): Promise<ImageWithLayer[]> => {
  const loadImage = ([path, layer, type]: [
    string,
    ImageLayer,
    ImageType
  ]): Promise<ImageWithLayer> => {
    const image = new Image();

    return new Promise<void>((resolve) => {
      image.onload = () => {
        setTimeout(() => resolve(), 2000);
      };
      image.src = path;
    }).then(() => ({ image, layer, type }));
  };

  const imagePaths: [string, ImageLayer, ImageType][] = [
    [bgOutline, "bg", "outline"],
    [bg0, "bg", "fill"],
    [bg1, "bg", "fill"],
    [bg2, "bg", "fill"],
    [bg3, "bg", "fill"],
    [personOutline, "person", "outline"],
    [person0, "person", "fill"],
    [person1, "person", "fill"],
    [person2, "person", "fill"],
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
