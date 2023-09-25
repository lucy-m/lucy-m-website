import type { PRNG } from "seedrandom";
import {
  NumberSpringFns,
  PosFns,
  makeSceneObject,
  type Position,
  type SceneObject,
} from "../../model";
import { sceneSize } from "../scene-size";

export const makeFeather = (
  layerKey: string,
  initial: Position,
  initialVelocity: Position,
  random: PRNG
): SceneObject => {
  let position = initial;
  let xPosition = NumberSpringFns.make({
    endPoint: initialVelocity.x < 0 ? -200 : 200,
    position: initialVelocity.x * 100,
    velocity: initialVelocity.x,
    properties: {
      friction: 0,
      precision: 0.1,
      stiffness: 0.001,
      weight: 0.2,
    },
  });
  let yVelocity = initialVelocity.y;
  let rotation = 40;

  return makeSceneObject(random)((id) => ({
    typeName: "feather",
    layerKey,
    getPosition: () => position,
    getLayers: () => [
      {
        kind: "image",
        assetKey: "feather1",
        rotation: rotation,
      },
    ],
    onTick: () => {
      if (position.y > sceneSize.y) {
        return [
          {
            kind: "removeObject",
            target: id,
          },
        ];
      }

      const newPosition = PosFns.new(
        initial.x + xPosition.position,
        position.y + yVelocity
      );
      rotation -= xPosition.velocity;
      xPosition = NumberSpringFns.tick(xPosition, 1);
      yVelocity = Math.min(yVelocity + 0.2, 1.5);
      position = newPosition;

      return [];
    },
  }));
};
