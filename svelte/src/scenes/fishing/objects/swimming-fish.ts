import { type Observable } from "rxjs";
import type { PRNG } from "seedrandom";
import {
  PosFns,
  PositionSpringFns,
  generatePointsInShape,
  makeSceneObject,
  pointInShape,
  type FishName,
  type Position,
  type PositionSpring,
  type SceneObject,
  type Shape,
  type SpringProperties,
} from "../../../model";
import { pondBounds } from "./fish-pond";

type FishState = Readonly<
  | {
      kind: "wandering";
      location: PositionSpring;
    }
  | {
      kind: "chasing";
      current: Position;
      velocity: Position;
      target: Position;
    }
  | {
      kind: "biting";
      position: Position;
    }
>;

const wanderingSpringProperties: SpringProperties = {
  friction: 15,
  precision: 1,
  stiffness: 0.1,
  weight: 8,
};

export const swimmingFish = (args: {
  random: PRNG;
  pondBounds: Shape;
  bobberLocation$: Observable<Position | undefined>;
}): SceneObject => {
  const { random } = args;

  const getPointInPond = () => {
    return generatePointsInShape(1, args.pondBounds, random)[0] ?? PosFns.zero;
  };

  const fishType: FishName = (() => {
    if (random.quick() < 0.5) {
      return "commonBrown";
    } else {
      return "commonGrey";
    }
  })();

  let state: FishState = {
    kind: "wandering",
    location: PositionSpringFns.make({
      endPoint: getPointInPond(),
      position: getPointInPond(),
      velocity: PosFns.zero,
      properties: wanderingSpringProperties,
    }),
  };
  let bobberLocation: Position | undefined = undefined;

  const s = args.bobberLocation$.subscribe((bl) => {
    bobberLocation = bl;
  });

  return makeSceneObject(args.random)({
    typeName: "swimming-fish",
    layerKey: "pond",
    getPosition: () => {
      if (state.kind === "wandering") {
        return state.location.position;
      } else if (state.kind === "chasing") {
        return state.current;
      } else {
        return state.position;
      }
    },
    getLayers: () => [
      {
        kind: "image",
        assetKey: `${fishType}.shadow`,
        position: PosFns.new(-85, -50),
      },
    ],
    onTick: () => {
      // TODO: Prevent fish moving out of pond
      if (state.kind === "wandering") {
        const closeToEdge = !pointInShape(
          pondBounds,
          PosFns.add(state.location.position, state.location.velocity)
        );
        if (closeToEdge) {
          state = {
            kind: "wandering",
            location: PositionSpringFns.make({
              endPoint: getPointInPond(),
              position: state.location.position,
              velocity: PosFns.zero,
              properties: wanderingSpringProperties,
            }),
          };
        } else if (bobberLocation && random.quick() < 0.02) {
          const current = state.location.position;
          const target = bobberLocation;
          const toTarget = PosFns.sub(target, current);
          const velocity = PosFns.normalise(toTarget);

          state = {
            kind: "chasing",
            current,
            target,
            velocity,
          };
        } else if (random.quick() < 0.01) {
          state = {
            kind: "wandering",
            location: PositionSpringFns.set(state.location, {
              endPoint: getPointInPond(),
            }),
          };
        } else {
          state = {
            kind: "wandering",
            location: PositionSpringFns.tick(state.location, 0.1),
          };
        }
      } else if (state.kind === "chasing") {
        if (random.quick() < 0.04) {
          state = {
            kind: "wandering",
            location: PositionSpringFns.make({
              endPoint: getPointInPond(),
              velocity: state.velocity,
              position: state.current,
              properties: wanderingSpringProperties,
            }),
          };
        } else {
          if (
            PosFns.distance(state.current, state.target) <
            2 * PosFns.magnitude(state.velocity)
          ) {
            state = {
              kind: "biting",
              position: state.current,
            };
          } else {
            state = {
              kind: "chasing",
              current: PosFns.add(state.current, state.velocity),
              target: state.target,
              velocity: state.velocity,
            };
          }
        }
      }
    },
    onDestroy: () => {
      s.unsubscribe();
    },
    _getDebugInfo: () => ({
      stateKind: state.kind,
    }),
  });
};
