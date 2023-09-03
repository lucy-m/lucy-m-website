import type { PRNG } from "seedrandom";
import { seededUuid } from "../utils";
import type { AssetKey } from "./assets";
import { PosFns, type Position } from "./position";
import type {
  EmptyState,
  SceneObject,
  SceneObjectAction,
  SceneObjectActionApplyResult,
} from "./scene-types";

export const makeSceneObject =
  (random: PRNG) =>
  <TLayerKey extends string>(
    obj: Omit<SceneObject<TLayerKey, EmptyState>, "id" | "state">
  ): SceneObject<TLayerKey, EmptyState> => {
    return {
      id: seededUuid(random),
      state: {},
      ...obj,
    };
  };

export const makeSceneObjectStateful =
  (random: PRNG) =>
  <TLayerKey extends string, TState>(
    obj: Omit<SceneObject<TLayerKey, TState>, "id">
  ): SceneObject<TLayerKey, TState> => {
    return {
      id: seededUuid(random),
      ...obj,
    };
  };

export const applySceneObjectAction = <TLayerKey extends string, TState>(
  obj: SceneObject<TLayerKey, TState>,
  action: SceneObjectAction<TLayerKey, TState>
): SceneObjectActionApplyResult<TLayerKey, TState> => {
  switch (action.kind) {
    case "hide":
      return {
        kind: "update",
        object: {
          ...obj,
          hidden: true,
        },
      };
    case "show":
      return {
        kind: "update",
        object: {
          ...obj,
          hidden: false,
        },
      };
    case "moveBy": {
      return {
        kind: "update",
        object: {
          ...obj,
          position: PosFns.add(obj.position, action.by),
        },
      };
    }
    case "moveTo": {
      return {
        kind: "update",
        object: {
          ...obj,
          position: action.to,
        },
      };
    }
    case "updateState": {
      return {
        kind: "update",
        object: {
          ...obj,
          state: { ...obj.state, ...action.state },
        },
      };
    }
    case "removeObject": {
      return { kind: "removeObject" };
    }
    case "sceneAction": {
      return action;
    }
  }
};

/**
 * Gets the bounding box of the object in world co-ords.
 */
export const getObjectBoundingBox = (
  obj: SceneObject<string, unknown>,
  images: Record<AssetKey, HTMLImageElement>
): { topLeft: Position; bottomRight: Position } => {
  const relativeBoundingBox = obj
    .getLayers(obj)
    .reduce<readonly [Position, Position] | undefined>((acc, next) => {
      if (next.kind === "text") {
        return acc;
      } else {
        const left = next.position?.x ?? 0;
        const top = next.position?.y ?? 0;

        const right = images[next.assetKey].width + left;
        const bottom = images[next.assetKey].height + top;

        if (!acc) {
          return [PosFns.new(left, top), PosFns.new(right, bottom)] as const;
        } else {
          return [
            PosFns.new(Math.min(left, acc[0].x), Math.min(top, acc[0].y)),
            PosFns.new(Math.max(right, acc[1].y), Math.max(bottom, acc[1].y)),
          ] as const;
        }
      }
    }, undefined);

  if (!relativeBoundingBox) {
    return { topLeft: PosFns.zero, bottomRight: PosFns.zero };
  } else {
    const topLeft = PosFns.add(relativeBoundingBox[0], obj.position);
    const bottomRight = PosFns.add(relativeBoundingBox[1], obj.position);

    return { topLeft, bottomRight };
  }
};

/** Gets objects in order, from top to bottom */
export const getObjectsInOrder = <TLayerKey extends string>(
  objects: readonly SceneObject<TLayerKey, unknown>[],
  layerOrder: readonly TLayerKey[],
  order: "top-to-bottom" | "bottom-to-top"
): SceneObject<TLayerKey, unknown>[] => {
  const byLayer = objects.reduce<
    Partial<Record<TLayerKey, SceneObject<TLayerKey, unknown>[]>>
  >(
    (acc, next) => ({
      ...acc,
      [next.layerKey]: [...(acc[next.layerKey] ?? []), next],
    }),
    {}
  );

  const bottomToTop = layerOrder.reduce<SceneObject<TLayerKey, unknown>[]>(
    (acc, layer) => [...acc, ...(byLayer[layer] ?? [])],
    []
  );

  if (order === "bottom-to-top") {
    return bottomToTop;
  } else {
    return bottomToTop.reverse();
  }
};
