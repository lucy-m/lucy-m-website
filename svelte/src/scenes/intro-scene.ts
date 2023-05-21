import { writable, type Readable } from "svelte/store";
import layer0 from "../assets/intro-scene/0.PNG";
import layer1 from "../assets/intro-scene/1.PNG";
import layer2 from "../assets/intro-scene/2.PNG";
import layer3 from "../assets/intro-scene/3.PNG";
import layer4 from "../assets/intro-scene/4.PNG";
import type { FetchState } from "../model/fetch-state";

export interface Scene {
  images: HTMLImageElement[];
}

export const loadIntroScene = (): Readable<FetchState<Scene>> => {
  const store = writable<FetchState<Scene>>({ kind: "loading" });

  const loadImage = (path: string): Promise<HTMLImageElement> => {
    const image = new Image();

    return new Promise<void>((resolve) => {
      image.onload = () => resolve();
      image.src = path;
    }).then(() => image);
  };

  const paths = [layer0, layer1, layer2, layer3, layer4];
  const promises = paths.map(loadImage);

  Promise.all(promises).then((images) => {
    store.set({ kind: "loaded", data: { images } });
  });

  return { subscribe: store.subscribe };
};
