import {
  NumberSpringFns,
  PosFns,
  makeSceneObjectStateful,
  type NumberSpring,
  type Position,
  type SceneObject,
} from "../model";

interface FeatherState {
  xPosition: NumberSpring;
  yVelocity: number;
}

export const makeFeather = <TLayerKey extends string>(
  layerKey: TLayerKey,
  initial: Position,
  initialVelocity: Position
): SceneObject<TLayerKey, FeatherState> => {
  return makeSceneObjectStateful<TLayerKey, FeatherState>({
    layerKey,
    position: initial,
    getLayers: () => [
      { kind: "image", assetKey: "feather1", subLayer: "background" },
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
    },
    onTick: (current) => {
      const newPosition = PosFns.new(
        initial.x + current.state.xPosition.position,
        current.position.y + current.state.yVelocity
      );
      const tickedSpring = NumberSpringFns.tick(current.state.xPosition, 1);
      const yVelocity = Math.min(current.state.yVelocity + 0.2, 1);

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
          },
        },
      ];
    },
  });
};
