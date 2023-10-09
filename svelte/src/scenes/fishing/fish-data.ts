interface FishData {
  backgroundSrc: string;
  displayName: string;
}

export const getFishData = (fishType: string): FishData => {
  switch (fishType) {
    case "commonBrown":
      return {
        backgroundSrc: "/assets/scene-fishing/fish/1_brown_bg.jpg",
        displayName: "Common mudfish",
      };

    case "commonGrey":
      return {
        backgroundSrc: "/assets/scene-fishing/fish/2_grey_bg.jpg",
        displayName: "Common bitterfish",
      };

    case "commonBrownGrey":
      return {
        backgroundSrc: "/assets/scene-fishing/fish/3_brown_grey_bg.jpg",
        displayName: "Common shallow flowerfish",
      };

    default:
      return {
        backgroundSrc: "/assets/scene-fishing/fish/1_brown_bg.jpg",
        displayName: "Mysteryfish",
      };
  }
};
