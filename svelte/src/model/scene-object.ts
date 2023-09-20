import type { PRNG } from "seedrandom";
import { seededUuid } from "../utils";
import type { AssetKey } from "./assets";
import { PosFns, type Position } from "./position";
import type { SceneObject } from "./scene-types";

export const makeSceneObject =
  (random: PRNG) =>
  (
    obj: Omit<SceneObject, "id"> | ((id: string) => Omit<SceneObject, "id">)
  ): SceneObject => {
    const id = seededUuid(random);

    if (typeof obj === "function") {
      return {
        id,
        ...obj(id),
      };
    } else {
      return {
        id: seededUuid(random),
        ...obj,
      };
    }
  };

/**
 * Gets the bounding box of the object in world co-ords.
 */
export const getObjectBoundingBox = (
  obj: SceneObject,
  images: Record<AssetKey, HTMLImageElement>
): { topLeft: Position; bottomRight: Position } => {
  const relativeBoundingBox = obj
    .getLayers()
    .reduce<readonly [Position, Position] | undefined>((acc, next) => {
      if (next.kind === "text" || next.kind === "ctxDraw") {
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
    const topLeft = PosFns.add(relativeBoundingBox[0], obj.getPosition());
    const bottomRight = PosFns.add(relativeBoundingBox[1], obj.getPosition());

    return { topLeft, bottomRight };
  }
};

/** Gets objects in order, from top to bottom */
export const getObjectsInOrder = (
  objects: readonly SceneObject[],
  layerOrder: readonly string[],
  order: "top-to-bottom" | "bottom-to-top"
): SceneObject[] => {
  const byLayer = objects.reduce<Partial<Record<string, SceneObject[]>>>(
    (acc, next) => ({
      ...acc,
      [next.layerKey]: [...(acc[next.layerKey] ?? []), next],
    }),
    {}
  );

  const bottomToTop = layerOrder.reduce<SceneObject[]>(
    (acc, layer) => [...acc, ...(byLayer[layer] ?? [])],
    []
  );

  if (order === "bottom-to-top") {
    return bottomToTop;
  } else {
    return bottomToTop.reverse();
  }
};
