import { entriesToRecord, recordToEntries } from "../utils";

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

export type AssetKey = keyof typeof imagePaths;

const loadImage = (absPath: string): Promise<HTMLImageElement> => {
  const image = new Image();
  return new Promise<void>((resolve) => {
    image.onload = () => {
      resolve();
    };
    image.src = absPath;
  }).then(() => image);
};

export const loadImages = (): Promise<Record<AssetKey, HTMLImageElement>> => {
  const promises = recordToEntries(imagePaths).map(([assetKey, path]) =>
    loadImage(path).then((image) => [assetKey, image] as const)
  );

  return Promise.all(promises).then((entries) => entriesToRecord(entries));
};
