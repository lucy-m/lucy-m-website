import {
  NumberSpringFns,
  PosFns,
  makeSceneObjectStateful,
  type NumberSpring,
  type Position,
  type SceneObject,
} from "../model";

export const makeCruisingBird = <TLayerKey extends string>(
  layerKey: TLayerKey,
  initial: Position,
  rangeY: [number, number]
): SceneObject<TLayerKey, unknown> => {
  const rangeMin = Math.min(rangeY[0], rangeY[1]);
  const rangeRange = Math.abs(rangeY[0] - rangeY[1]);
  const makeNewEndPoint = () => Math.random() * rangeRange + rangeMin;

  return makeSceneObjectStateful<TLayerKey, { yPosition: NumberSpring }>({
    layerKey,
    position: PosFns.new(initial.x, initial.y),
    state: (() => {
      const yPosition = NumberSpringFns.make({
        endPoint: makeNewEndPoint(),
        position: initial.y,
        velocity: 0,
        properties: {
          friction: 8,
          precision: 0.1,
          stiffness: 0.1,
          weight: 0.05,
        },
      });

      return { yPosition };
    })(),
    getLayers: () => [
      {
        kind: "image",
        assetKey: "birdFlapUp",
        subLayer: "background",
      },
    ],
    onTick: (current) => {
      const newPosition =
        current.position.x > 2000
          ? PosFns.new(-180, current.position.y)
          : PosFns.new(
              current.position.x + 2,
              current.state.yPosition.position
            );

      const newSpring = current.state.yPosition.stationary
        ? NumberSpringFns.set(current.state.yPosition, {
            endPoint: makeNewEndPoint(),
          })
        : NumberSpringFns.tick(current.state.yPosition, 0.1);

      return [
        { kind: "moveTo", to: newPosition },
        { kind: "updateState", state: { yPosition: newSpring } },
      ];
    },
  });
};
