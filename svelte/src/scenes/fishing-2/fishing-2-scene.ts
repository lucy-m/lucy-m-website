import { of } from "rxjs";
import { makeSceneType, type SceneObject, type SceneSpec } from "../../model";
import { presetPaths } from "./objects/trace-paths/preset-paths";

export const makeFishing2Scene: SceneSpec = ({ random }) => {
  const objects: SceneObject[] = [presetPaths.fish(random)];

  return makeSceneType({
    typeName: "fishing2",
    events: of(),
    layerOrder: ["trace-path", "path-marker"],
    objects,
  });
};
