import {
  NumberSpringFns,
  PosFns,
  makeSceneObjectStateful,
  type NumberSpring,
  type Position,
  type SceneObject,
} from "../model";

interface CruisingBirdState {
  flapUp: boolean;
  flapTimer: number;
  yPosition: NumberSpring;
}

export const makeCruisingBird = <TLayerKey extends string>(
  layerKey: TLayerKey,
  initial: Position,
  rangeY: [number, number]
): SceneObject<TLayerKey, unknown> => {
  const rangeMin = Math.min(rangeY[0], rangeY[1]);
  const rangeRange = Math.abs(rangeY[0] - rangeY[1]);
  const makeNewEndPoint = () => Math.random() * rangeRange + rangeMin;

  return makeSceneObjectStateful<TLayerKey, CruisingBirdState>({
    layerKey,
    position: PosFns.new(initial.x, initial.y),
    state: {
      flapUp: true,
      flapTimer: 0,
      yPosition: NumberSpringFns.make({
        endPoint: makeNewEndPoint(),
        position: initial.y,
        velocity: 0,
        properties: {
          friction: 8,
          precision: 1,
          stiffness: 0.1,
          weight: 0.05,
        },
      }),
    },
    getLayers: (current) => [
      {
        kind: "image",
        assetKey: current.state.flapUp ? "birdFlapUp" : "birdFlapDown",
        subLayer: "background",
      },
    ],
    onInteract: (current) => {
      return [
        {
          kind: "updateState",
          state: {
            yPosition: NumberSpringFns.set(current.state.yPosition, {
              velocity: current.state.yPosition.velocity - 14,
              endPoint: makeNewEndPoint(),
            }),
          },
        },
      ];
    },
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

      const flapState: Partial<CruisingBirdState> = (() => {
        if (current.state.yPosition.velocity > -0.2) {
          return { flapUp: true };
        }

        return current.state.flapTimer >= 5
          ? { flapUp: !current.state.flapUp, flapTimer: 0 }
          : {
              flapTimer:
                current.state.flapTimer +
                Math.min(Math.abs(current.state.yPosition.velocity), 2),
            };
      })();

      return [
        { kind: "moveTo", to: newPosition },
        {
          kind: "updateState",
          state: { yPosition: newSpring },
        },
        {
          kind: "updateState",
          state: flapState,
        },
      ];
    },
  });
};
