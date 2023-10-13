interface FishData {
  backgroundSrc: string;
  displayName: string;
  weight: number;
  flavour: string;
}

export const getFishData = (fishType: string): FishData => {
  switch (fishType) {
    case "commonBrown":
      return {
        backgroundSrc: "/assets/scene-fishing/fish/1_brown_bg.jpg",
        displayName: "Common mudfish",
        weight: 0.2,
        flavour:
          "Awakened by the soft hum of insects or the pattering of raindrops, this unassuming fish emerges, its dull scales shimmering like the subdued glimmer of forgotten treasure in the mire.",
      };

    case "commonGrey":
      return {
        backgroundSrc: "/assets/scene-fishing/fish/2_grey_bg.jpg",
        displayName: "Common bitterfish",
        weight: 0.24,
        flavour:
          "Legends speak of its tendency to swim against the current, a silent rebel in the aquatic realm, leaving an aftertaste of bitterness in the wake of its subtle defiance.",
      };

    case "commonBrownGrey":
      return {
        backgroundSrc: "/assets/scene-fishing/fish/3_brown_grey_bg.jpg",
        displayName: "Common shallow flowerfish",
        weight: 0.8,
        flavour:
          "A serene, living tapestry, this fish adds a burst of color to the tranquil gardens hidden beneath the surface.",
      };

    default:
      return {
        backgroundSrc: "/assets/scene-fishing/fish/1_brown_bg.jpg",
        displayName: "Mysteryfish",
        weight: 1,
        flavour:
          "To gaze upon the Mysteryfish is to peer into the mysteries of the aquatic unknown, where every fin movement hints at a story buried in the fathomless depths.",
      };
  }
};
