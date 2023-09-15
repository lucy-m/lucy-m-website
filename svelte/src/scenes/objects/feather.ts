import type { PRNG } from "seedrandom";
import {
  NumberSpringFns,
  PosFns,
  makeSceneObjectStateful,
  type NumberSpring,
  type Position,
  type SceneObject,
} from "../../model";
import { sceneSize } from "../scene-size";

interface FeatherState {
  xPosition: NumberSpring;
  yVelocity: number;
  rotation: number;
}

export const makeFeather = <TLayerKey extends string>(
  layerKey: TLayerKey,
  initial: Position,
  initialVelocity: Position,
  random: PRNG
): SceneObject<TLayerKey, FeatherState> => {
  return makeSceneObjectStateful(random)<TLayerKey, FeatherState>({
    typeName: "feather",
    layerKey,
    position: initial,
    getLayers: (current) => [
      {
        kind: "image",
        assetKey: "feather1",
        subLayer: "background",
        rotation: current.state.rotation,
      },
    ],
    state: {
      xPosition: NumberSpringFns.make({
        endPoint: initialVelocity.x < 0 ? -200 : 200,
        position: initialVelocity.x * 100,
        velocity: initialVelocity.x,
        properties: {
          friction: 0,
          precision: 0.1,
          stiffness: 0.001,
          weight: 0.2,
        },
      }),
      yVelocity: initialVelocity.y,
      rotation: 40,
    },
    onTick: (current) => {
      if (current.position.y > sceneSize.y) {
        return [
          {
            kind: "removeObject",
          },
        ];
      }

      const newPosition = PosFns.new(
        initial.x + current.state.xPosition.position,
        current.position.y + current.state.yVelocity
      );
      const tickedSpring = NumberSpringFns.tick(current.state.xPosition, 1);
      const yVelocity = Math.min(current.state.yVelocity + 0.2, 1.5);

      return [
        {
          kind: "moveTo",
          to: newPosition,
        },
        {
          kind: "updateState",
          state: {
            xPosition: tickedSpring,
            yVelocity,
            rotation: current.state.rotation - current.state.xPosition.velocity,
          },
        },
      ];
    },
  });
};
