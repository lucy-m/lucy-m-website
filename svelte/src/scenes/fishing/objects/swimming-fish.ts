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
  type SceneAction,
  type SceneObject,
  type Shape,
  type SpringProperties,
} from "../../../model";
import { chooseOp } from "../../../utils";
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
    }
  | {
      kind: "biting";
      position: Position;
      flipped: boolean;
    }
  | {
      kind: "entering";
      position: Position;
    }
>;

const isFlipped = (state: FishState): boolean => {
  switch (state.kind) {
    case "wandering":
      return state.location.velocity.x < 0;
    case "chasing":
      return state.velocity.x < 0;
    case "biting":
      return state.flipped;
    case "entering":
      return true;
  }
};

const wanderingSpringProperties: SpringProperties = {
  friction: 15,
  precision: 1,
  stiffness: 0.1,
  weight: 8,
};

const tickState = (args: {
  state: FishState;
  getPointInPond: () => Position;
  bobberLocation: Position | undefined;
  random: PRNG;
  onBite: () => void;
}): FishState => {
  const { state, getPointInPond, bobberLocation, random, onBite } = args;

  if (state.kind === "wandering") {
    const closeToEdge = !pointInShape(
      pondBounds,
      PosFns.add(state.location.position, state.location.velocity)
    );
    if (closeToEdge) {
      return {
        kind: "wandering",
        location: PositionSpringFns.make({
          endPoint: getPointInPond(),
          position: state.location.position,
          velocity: PosFns.zero,
          properties: wanderingSpringProperties,
        }),
      };
    } else if (bobberLocation && random.quick() < 0.01) {
      const current = state.location.position;
      const target = bobberLocation;
      const toTarget = PosFns.sub(target, current);
      const magnitude = PosFns.magnitude(toTarget);
      const velocity = PosFns.scale(
        PosFns.normalise(toTarget),
        Math.sqrt(magnitude) * 0.4
      );

      return {
        kind: "chasing",
        current,
        velocity,
      };
    } else if (random.quick() < 0.01) {
      return {
        kind: "wandering",
        location: PositionSpringFns.set(state.location, {
          endPoint: getPointInPond(),
        }),
      };
    } else {
      return {
        kind: "wandering",
        location: PositionSpringFns.tick(state.location, 0.1),
      };
    }
  } else if (state.kind === "chasing") {
    if (bobberLocation === undefined) {
      return {
        kind: "wandering",
        location: PositionSpringFns.make({
          endPoint: getPointInPond(),
          velocity: PosFns.scale(state.velocity, 0.2),
          position: state.current,
          properties: wanderingSpringProperties,
        }),
      };
    } else {
      if (
        PosFns.distance(state.current, bobberLocation) <
        2 * PosFns.magnitude(state.velocity)
      ) {
        onBite();
        return {
          kind: "biting",
          position: state.current,
          flipped: isFlipped(state),
        };
      } else {
        return {
          kind: "chasing",
          current: PosFns.add(state.current, state.velocity),
          velocity: state.velocity,
        };
      }
    }
  } else if (state.kind === "entering") {
    if (pointInShape(pondBounds, state.position)) {
      return {
        kind: "wandering",
        location: PositionSpringFns.make({
          endPoint: getPointInPond(),
          position: state.position,
          velocity: PosFns.zero,
          properties: wanderingSpringProperties,
        }),
      };
    } else {
      return {
        kind: "entering",
        position: PosFns.add(state.position, PosFns.new(-2, 0)),
      };
    }
  } else {
    return state;
  }
};

export const swimmingFish = (args: {
  /**
   * Initial position of the fish. If not specified, will pick a random
   *   point in the pondBounds.
   */
  initial: Position | undefined;
  random: PRNG;
  pondBounds: Shape;
  bobberLocation$: Observable<Position | undefined>;
  removeBitingFish$: Observable<void>;
  onBite: (fishName: FishName) => void;
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
    kind: "entering",
    position: args.initial ?? getPointInPond(),
  };
  let bobberLocation: Position | undefined = undefined;

  const s = args.bobberLocation$.subscribe((bl) => {
    bobberLocation = bl;
  });

  const makeEvents$ = (id: string) =>
    args.removeBitingFish$.pipe(
      chooseOp<void, SceneAction>(() => {
        if (state.kind === "biting") {
          return {
            kind: "removeObject",
            target: id,
          };
        }
      })
    );

  return makeSceneObject(args.random)((id) => ({
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
        assetKey: isFlipped(state)
          ? `${fishType}.shadow-flip`
          : `${fishType}.shadow`,
        position: PosFns.new(-85, -50),
      },
    ],
    onTick: () => {
      state = tickState({
        state,
        bobberLocation,
        getPointInPond,
        random,
        onBite: () => args.onBite(fishType),
      });
    },
    onDestroy: () => {
      s.unsubscribe();
    },
    _getDebugInfo: () => ({
      stateKind: state.kind,
    }),
    events$: makeEvents$(id),
  }));
};
