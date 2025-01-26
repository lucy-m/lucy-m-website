import { entriesToRecord, recordToEntries } from "../utils";

const fishPaths = {
  commonBrown: "/assets/scene-fishing/fish/1_brown.png",
  commonGrey: "/assets/scene-fishing/fish/2_grey.png",
  commonBrownGrey: "/assets/scene-fishing/fish/3_brown_grey.png",
} as const;

export type FishName = keyof typeof fishPaths;

type FishStates = "no-bg" | "shadow" | "no-bg-flip" | "shadow-flip";

type FishAsset = `${FishName}.${FishStates}`;

const talentPaths = {
  placeholder: "/assets/scene-fishing/talents/placeholder.jpg",
} as const;

const talentAssets = entriesToRecord(
  recordToEntries(talentPaths).map(
    ([key, value]) => [`talent.${key}`, value] as const
  )
);

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
  openGameMenuIcon: "/assets/scene-fishing/menu-icons/menu.PNG",
  openTalentsIcon: "/assets/scene-fishing/menu-icons/talents.PNG",

  markerBlue: "/assets/scene-fishing/marker-blue.png",

  ...talentAssets,
} as const;

export type AssetKey = keyof typeof imagePaths | FishAsset;

const loadImage = (absPath: string): Promise<ImageBitmap> => {
  const image = new Image();
  return new Promise<void>((resolve) => {
    image.onload = () => {
      resolve();
    };
    image.src = absPath;
  }).then(() => createImageBitmap(image));
};

const shadowise = (image: ImageBitmap): Promise<ImageBitmap> => {
  const offscreen = new OffscreenCanvas(image.width, image.height);
  const ctx = offscreen.getContext("2d");
  if (!ctx) {
    throw new Error("Could not shadowize image");
  }
  ctx.drawImage(image, 0, 0);
  const imageData = ctx.getImageData(0, 0, image.width, image.height);

  for (let i = 0; i < imageData.data.length; i += 4) {
    const a = imageData.data[i + 3];

    if (a > 0) {
      imageData.data[i] = 60;
      imageData.data[i + 1] = 102;
      imageData.data[i + 2] = 115;
      imageData.data[i + 3] = 255;
    }
  }

  const bitmap = createImageBitmap(imageData);

  return bitmap;
};

const flip = (image: ImageBitmap): Promise<ImageBitmap> => {
  const offscreen = new OffscreenCanvas(image.width, image.height);
  const ctx = offscreen.getContext("2d");
  if (!ctx) {
    throw new Error("Could not flip image");
  }
  ctx.scale(-1, 1);
  ctx.translate(-image.width, 0);
  ctx.drawImage(image, 0, 0);
  const imageData = ctx.getImageData(0, 0, image.width, image.height);
  const bitmap = createImageBitmap(imageData);
  return bitmap;
};

export const loadImages = (): Promise<Record<AssetKey, ImageBitmap>> => {
  const imagePromises = Promise.all(
    recordToEntries(imagePaths).map(([assetKey, path]) =>
      loadImage(path).then((image) => [assetKey, image] as const)
    )
  );

  const fishPromises = Promise.all(
    recordToEntries(fishPaths).map(([assetKey, path]) =>
      loadImage(path).then((image) => {
        const shadowised = shadowise(image);
        const flipped = flip(image);
        const shadowisedFlipped = shadowised.then(flip);

        return Promise.all([shadowised, flipped, shadowisedFlipped]).then(
          ([shadowised, flipped, shadowisedFlipped]) => {
            return [
              [(assetKey + ".no-bg") as FishAsset, image] as const,
              [(assetKey + ".shadow") as FishAsset, shadowised] as const,
              [(assetKey + ".no-bg-flip") as FishAsset, flipped] as const,
              [
                (assetKey + ".shadow-flip") as FishAsset,
                shadowisedFlipped,
              ] as const,
            ];
          }
        );
      })
    )
  ).then((fishes) => {
    const flattened = fishes.reduce((a, b) => [...a, ...b], []);
    return flattened;
  });

  return Promise.all([imagePromises, fishPromises]).then(([images, fishes]) => {
    const entries = [...images, ...fishes];
    return entriesToRecord<AssetKey, ImageBitmap>(entries);
  });
};
