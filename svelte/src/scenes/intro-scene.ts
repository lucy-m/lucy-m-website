import { Observable, from, map, of, switchMap, timer, zip } from "rxjs";
import layer0 from "../assets/intro-scene/0.PNG";
import layer1 from "../assets/intro-scene/1.PNG";
import layer2 from "../assets/intro-scene/2.PNG";
import layer3 from "../assets/intro-scene/3.PNG";
import layer4 from "../assets/intro-scene/4.PNG";

export const loadIntroScene = (): Promise<HTMLImageElement[]> => {
  const loadImage = (path: string): Promise<HTMLImageElement> => {
    const image = new Image();

    return new Promise<void>((resolve) => {
      image.onload = () => resolve();
      image.src = path;
    }).then(() => image);
  };

  const paths = [layer4, layer0, layer3, layer2, layer1];
  const promises = paths.map(loadImage);

  return Promise.all(promises);
};

export const throttleImages = (
  images: HTMLImageElement[]
): Observable<HTMLImageElement> => {
  const baseDataSource: Observable<HTMLImageElement> = of(images).pipe(
    switchMap((images) => {
      return zip(from(images), timer(0, 200)).pipe(map(([image]) => image));
    })
  );

  return baseDataSource;
};
