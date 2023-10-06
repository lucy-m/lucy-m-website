import { entriesToRecord, recordToEntries } from "../utils";

const imagePaths = {
  introBackground: "/assets/scene-intro/background.PNG",
  personSitting: "/assets/scene-intro/person-sitting.png",
  personHead: "/assets/scene-intro/person head.PNG",
  speechBubble: "/assets/scene-intro/speech-bubble.png",
  tree1: "/assets/scene-intro/trees/tree1.PNG",
  tree2: "/assets/scene-intro/trees/tree2.PNG",
  tree3: "/assets/scene-intro/trees/tree3.PNG",
  birdFlapUp: "/assets/scene-intro/bird-flap-up.png",
  birdFlapDown: "/assets/scene-intro/bird-flap-down.png",
  feather1: "/assets/scene-intro/feather-1.png",
  houseSmall: "/assets/scene-intro/house-small.png",

  fishingBackground: "/assets/scene-fishing/fishing-bg.PNG",
  idleMan: "/assets/scene-fishing/idle.PNG",
  castOffCastingMan: "/assets/scene-fishing/cast-off-1.PNG",
  castOffWaitingMan: "/assets/scene-fishing/cast-off-2.PNG",
  bobber: "/assets/scene-fishing/bobber.PNG",
  biteMarker: "/assets/scene-fishing/bite-marker.PNG",
  bigPole: "/assets/scene-fishing/pole.PNG",
  reelSpinner: "/assets/scene-fishing/reel-spinner.PNG",
  fish1: "/assets/scene-fishing/fish-1.PNG",
  openGameMenuIcon: "/assets/scene-fishing/menu.PNG",

  brownFish: "/assets/scene-fishing/fish/1_brown.png",
};

export type AssetKey = keyof typeof imagePaths;

const loadImage = (absPath: string): Promise<ImageBitmap> => {
  const image = new Image();
  return new Promise<void>((resolve) => {
    image.onload = () => {
      resolve();
    };
    image.src = absPath;
  }).then(() => createImageBitmap(image));
};

export const loadImages = (): Promise<Record<AssetKey, ImageBitmap>> => {
  const promises = recordToEntries(imagePaths).map(([assetKey, path]) =>
    loadImage(path).then((image) => [assetKey, image] as const)
  );

  return Promise.all(promises).then((entries) => entriesToRecord(entries));
};
