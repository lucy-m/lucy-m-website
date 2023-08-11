import { entriesToRecord, recordToEntries } from "../utils";

const imagePaths = {
  background: "/assets/scene-intro/background.PNG",

  personSitting: "/assets/scene-intro/person-sitting.png",
  personHead: "/assets/scene-intro/person head.PNG",
  speechBubble: "/assets/scene-intro/speech-bubble.png",
  tree1: "/assets/scene-intro/trees/tree1.PNG",
  tree2: "/assets/scene-intro/trees/tree2.PNG",
  tree3: "/assets/scene-intro/trees/tree3.PNG",
  birdFlapUp: "/assets/scene-intro/bird-flap-up.png",
  birdFlapDown: "/assets/scene-intro/bird-flap-down.png",
  feather1: "/assets/scene-intro/feather-1.png",
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
