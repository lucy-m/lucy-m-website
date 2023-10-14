import type { Observable } from "rxjs";
import type { PRNG } from "seedrandom";
import { makeSceneObject, PosFns, type SceneObject } from "../../../model";
import { sceneSize } from "../../scene-size";
import type { FishingSceneState } from "../fishing-scene-state";

export const makeTalentMenuIcon = (args: {
  random: PRNG;
  state$: Observable<FishingSceneState | undefined>;
  openTalentMenu: (state: FishingSceneState) => void;
}): SceneObject => {
  let currentState: FishingSceneState | undefined = undefined;

  const s = args.state$.subscribe((state) => {
    currentState = state;
  });

  return makeSceneObject(args.random)({
    layerKey: "ui",
    typeName: "talent-menu",
    getPosition: () => PosFns.new(sceneSize.x - 280, sceneSize.y - 140),
    getLayers: () => [
      {
        kind: "image",
        assetKey: "openTalentsIcon",
      },
    ],
    onInteract: () => {
      if (currentState) {
        args.openTalentMenu(currentState);
      }
    },
    onDestroy: () => {
      s.unsubscribe();
    },
  });
};
