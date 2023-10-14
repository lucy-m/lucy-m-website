import type { Observable } from "rxjs";
import type { PRNG } from "seedrandom";
import {
  makeSceneObject,
  OscillatorFns,
  PosFns,
  type SceneObject,
} from "../../../model";
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

  let interactShadow = OscillatorFns.make({
    amplitude: 10,
    initial: 20,
    period: 80,
    time: 0,
  });

  return makeSceneObject(args.random)({
    layerKey: "ui",
    typeName: "talent-menu",
    getPosition: () => PosFns.new(sceneSize.x - 280, sceneSize.y - 140),
    getLayers: () => [
      {
        kind: "image",
        assetKey: "openTalentsIcon",
        shadow:
          currentState && currentState.level - 1 > currentState.talents.length
            ? {
                color: "hsl(37, 18%, 89%)",
                blur: interactShadow.position,
              }
            : undefined,
      },
    ],
    onInteract: () => {
      if (currentState) {
        args.openTalentMenu(currentState);
      }
    },
    onTick: () => {
      interactShadow = OscillatorFns.tick(interactShadow, 1);
    },
    onDestroy: () => {
      s.unsubscribe();
    },
  });
};
