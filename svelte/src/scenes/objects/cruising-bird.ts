import type { PRNG } from "seedrandom";
import {
  NumberSpringFns,
  PosFns,
  makeSceneObject,
  type SceneObject,
  type SceneObjectAction,
} from "../../model";
import { sceneSize } from "../scene-size";
import { makeFeather } from "./feather";

export const makeCruisingBird = <TLayerKey extends string>(
  layerKey: TLayerKey,
  initialX: number,
  rangeY: [number, number],
  random: PRNG
): SceneObject<TLayerKey> => {
  const rangeMin = Math.min(rangeY[0], rangeY[1]);
  const rangeRange = Math.abs(rangeY[0] - rangeY[1]);
  const makeNewYEndPoint = () => random.quick() * rangeRange + rangeMin;
  const makeNewXEndPoint = () => random.quick() * 1 + 1.5;

  const initialY = makeNewYEndPoint();

  let flapUp = true;
  let flapTimer = 0;
  let featherCount = 2;
  let yPosition = NumberSpringFns.make({
    endPoint: makeNewYEndPoint(),
    position: initialY,
    velocity: 0,
    properties: {
      friction: 8,
      precision: 1,
      stiffness: 0.1,
      weight: 0.05,
    },
  });
  let xVelocity = NumberSpringFns.make({
    endPoint: makeNewXEndPoint(),
    position: 2,
    velocity: 0,
    properties: {
      friction: 30,
      precision: 0.1,
      stiffness: 0.1,
      weight: 0.1,
    },
  });
  let positionX = initialX;

  const getPosition = () => PosFns.new(positionX, yPosition.position);

  return makeSceneObject(random)<TLayerKey>((id) => ({
    typeName: "cruising-bird",
    layerKey,
    getPosition,
    getLayers: () => [
      {
        kind: "image",
        assetKey: flapUp ? "birdFlapUp" : "birdFlapDown",
        subLayer: "background",
      },
    ],
    _getDebugInfo: () => ({
      flapUp,
    }),
    onInteract: () => {
      const spawnFeathersActions: SceneObjectAction<TLayerKey>[] = (() => {
        const makeFeatherAction = (): SceneObjectAction<TLayerKey> => ({
          kind: "sceneAction",
          action: {
            kind: "addObject",
            makeObject: () =>
              makeFeather(
                layerKey,
                getPosition(),
                PosFns.new(random.quick() * 2 - 1, random.quick() * 5 - 4),
                random
              ),
          },
        });

        if (random.quick() < 0.2) {
          if (featherCount > 0) {
            featherCount--;

            return [makeFeatherAction()];
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

      yPosition = NumberSpringFns.set(yPosition, {
        velocity: yPosition.velocity - 14,
        endPoint: makeNewYEndPoint(),
      });

      return spawnFeathersActions;
    },
    onTick: () => {
      if (positionX > sceneSize.x) {
        return [
          {
            kind: "removeObject",
            target: id,
          },
        ];
      }

      positionX += xVelocity.position;

      if (yPosition.stationary) {
        yPosition = NumberSpringFns.set(yPosition, {
          endPoint: makeNewYEndPoint(),
        });
      } else {
        yPosition = NumberSpringFns.tick(yPosition, 0.1);
      }

      if (xVelocity.stationary) {
        xVelocity = NumberSpringFns.set(xVelocity, {
          endPoint: makeNewXEndPoint(),
        });
      } else {
        xVelocity = NumberSpringFns.tick(xVelocity, 0.1);
      }

      if (yPosition.velocity > -0.2) {
        flapUp = true;
      } else {
        if (flapTimer >= 5) {
          flapUp = !flapUp;
          flapTimer = 0;
        } else {
          flapTimer += Math.min(Math.abs(yPosition.velocity), 2);
        }
      }

      return [];
    },
  }));
};
