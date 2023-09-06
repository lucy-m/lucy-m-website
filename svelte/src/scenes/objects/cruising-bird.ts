import type { PRNG } from "seedrandom";
import {
  NumberSpringFns,
  PosFns,
  makeSceneObjectStateful,
  type NumberSpring,
  type SceneObject,
  type SceneObjectAction,
} from "../../model";
import { sceneSize } from "../scene-size";
import { makeFeather } from "./feather";

interface CruisingBirdState {
  flapUp: boolean;
  flapTimer: number;
  xVelocity: NumberSpring;
  yPosition: NumberSpring;
  feathers: number;
}

export const makeCruisingBird = <TLayerKey extends string>(
  layerKey: TLayerKey,
  initialX: number,
  rangeY: [number, number],
  random: PRNG
): SceneObject<TLayerKey, CruisingBirdState> => {
  const rangeMin = Math.min(rangeY[0], rangeY[1]);
  const rangeRange = Math.abs(rangeY[0] - rangeY[1]);
  const makeNewYEndPoint = () => random.quick() * rangeRange + rangeMin;
  const makeNewXEndPoint = () => random.quick() * 1 + 1.5;

  const initialY = makeNewYEndPoint();

  return makeSceneObjectStateful(random)<TLayerKey, CruisingBirdState>({
    typeName: "cruising-bird",
    layerKey,
    position: PosFns.new(initialX, initialY),
    state: {
      flapUp: true,
      flapTimer: 0,
      feathers: 2,
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
      xVelocity: NumberSpringFns.make({
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
      const feathers: SceneObjectAction<TLayerKey, CruisingBirdState>[] =
        (() => {
          const makeFeatherAction = (): SceneObjectAction<
            TLayerKey,
            unknown
          > => ({
            kind: "sceneAction",
            action: {
              kind: "addObject",
              makeObject: () =>
                makeFeather(
                  layerKey,
                  current.position,
                  PosFns.new(random.quick() * 2 - 1, random.quick() * 5 - 4),
                  random
                ),
            },
          });

          if (random.quick() < 0.2) {
            if (current.state.feathers > 0) {
              return [
                makeFeatherAction(),
                {
                  kind: "updateState",
                  state: {
                    feathers: current.state.feathers - 1,
                  },
                },
              ];
            } else {
              return [
                makeFeatherAction(),
                makeFeatherAction(),
                makeFeatherAction(),
                makeFeatherAction(),
                {
                  kind: "removeObject",
                },
              ];
            }
          } else {
            return [];
          }
        })();

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
        ...feathers,
      ];
    },
    onTick: (current) => {
      const newPosition: SceneObjectAction<TLayerKey> =
        current.position.x > sceneSize.x
          ? { kind: "removeObject" }
          : {
              kind: "moveTo",
              to: PosFns.new(
                current.position.x + current.state.xVelocity.position,
                current.state.yPosition.position
              ),
            };

      const newYPosition = current.state.yPosition.stationary
        ? NumberSpringFns.set(current.state.yPosition, {
            endPoint: makeNewYEndPoint(),
          })
        : NumberSpringFns.tick(current.state.yPosition, 0.1);

      const newXVelocity = current.state.xVelocity.stationary
        ? NumberSpringFns.set(current.state.xVelocity, {
            endPoint: makeNewXEndPoint(),
          })
        : NumberSpringFns.tick(current.state.xVelocity, 0.1);

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
        newPosition,
        {
          kind: "updateState",
          state: {
            yPosition: newYPosition,
            xVelocity: newXVelocity,
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
