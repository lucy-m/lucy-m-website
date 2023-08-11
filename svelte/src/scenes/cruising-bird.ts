import {
  NumberSpringFns,
  PosFns,
  makeSceneObjectStateful,
  type NumberSpring,
  type SceneObject,
} from "../model";

interface CruisingBirdState {
  flapUp: boolean;
  flapTimer: number;
  xPosition: NumberSpring;
  yPosition: NumberSpring;
}

export const makeCruisingBird = <TLayerKey extends string>(
  layerKey: TLayerKey,
  initialX: number,
  rangeY: [number, number]
): SceneObject<TLayerKey, unknown> => {
  const rangeMin = Math.min(rangeY[0], rangeY[1]);
  const rangeRange = Math.abs(rangeY[0] - rangeY[1]);
  const makeNewYEndPoint = () => Math.random() * rangeRange + rangeMin;
  const makeNewXEndPoint = () => Math.random() * 1 + 1.5;

  const initialY = makeNewYEndPoint();

  return makeSceneObjectStateful<TLayerKey, CruisingBirdState>({
    layerKey,
    position: PosFns.new(initialX, initialY),
    state: {
      flapUp: true,
      flapTimer: 0,
      yPosition: NumberSpringFns.make({
        endPoint: makeNewYEndPoint(),
        position: initialY,
        velocity: 0,
        properties: {
          friction: 8,
          precision: 1,
          stiffness: 0.1,
          weight: 0.05,
        },
      }),
      xPosition: NumberSpringFns.make({
        endPoint: makeNewXEndPoint(),
        position: 2,
        velocity: 0,
        properties: {
          friction: 30,
          precision: 0.1,
          stiffness: 0.1,
          weight: 0.1,
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
              endPoint: makeNewYEndPoint(),
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
              current.position.x + current.state.xPosition.position,
              current.state.yPosition.position
            );

      const newYPositionSpring = current.state.yPosition.stationary
        ? NumberSpringFns.set(current.state.yPosition, {
            endPoint: makeNewYEndPoint(),
          })
        : NumberSpringFns.tick(current.state.yPosition, 0.1);

      const newXPositionSpring = current.state.xPosition.stationary
        ? NumberSpringFns.set(current.state.xPosition, {
            endPoint: makeNewXEndPoint(),
          })
        : NumberSpringFns.tick(current.state.xPosition, 0.1);

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
          state: {
            yPosition: newYPositionSpring,
            xPosition: newXPositionSpring,
          },
        },
        {
          kind: "updateState",
          state: flapState,
        },
      ];
    },
  });
};
