import { of } from "rxjs";
import {
  makeSceneType,
  PosFns,
  type Position,
  type SceneObject,
  type SceneSpec,
} from "../../model";
import { makeTracePath } from "./trace-path";

export const makeFishing2Scene: SceneSpec = ({ random }) => {
  const positions: Position[] = Array.from({
    length: 10,
  }).map((_, i) => PosFns.new(100 + 20 * i, 100 + 100 * i));

  const objects: SceneObject[] = [
    makeTracePath({
      random,
      positions,
    }),
  ];

  return makeSceneType({
    typeName: "fishing2",
    events: of(),
    layerOrder: ["path-marker"],
    objects,
  });
};
