import { Observable, map, merge, timer } from "rxjs";
import { type PRNG } from "seedrandom";
import {
  PosFns,
  generatePointsInShape,
  makeSceneObject,
  randomInterval,
  type SceneAction,
  type SceneObject,
  type SceneObjectStateless,
  type Shape,
} from "../model";
import type { AssetKey } from "../model/assets";
import { makeCruisingBird } from "./cruising-bird";

type LayerKey = "bg" | "person" | "speechBubble" | "trees" | "bird";

const layerOrder: LayerKey[] = [
  "bg",
  "trees",
  "bird",
  "person",
  "speechBubble",
];

const randomTree = (random: PRNG): AssetKey => {
  const r = random.quick() * 3;

  if (r < 1) {
    return "tree1";
  } else if (r < 2) {
    return "tree2";
  } else {
    return "tree3";
  }
};

const makeTrees = (
  target: number,
  shape: Shape,
  random: PRNG
): SceneObjectStateless<LayerKey>[] => {
  return generatePointsInShape(target, shape, random)
    .sort((a, b) => a.y - b.y)
    .map<SceneObjectStateless<LayerKey>>((position) => {
      const assetKey = randomTree(random);

      return makeSceneObject({
        position,
        layerKey: "trees",
        getLayers: () => [
          {
            kind: "image",
            assetKey,
            subLayer: "background",
          },
        ],
      });
    });
};

const speechBubble = makeSceneObject({
  layerKey: "speechBubble",
  position: PosFns.new(730, 260),
  getLayers: () => [
    {
      kind: "image",
      assetKey: "speechBubble",
      subLayer: "background",
    },
    {
      kind: "text",
      text: [
        "Hello! Thank you for visiting my little corner of the world.",
        "There's not much to see here yet but I'm working on it (promise).",
      ],
      position: PosFns.new(80, 90),
      maxWidth: 430,
    },
  ],
  hidden: true,
  onInteract: () => [{ kind: "hide" }],
});

const makeObjects = (random: PRNG): SceneObject<LayerKey, any>[] => [
  makeSceneObject({
    position: PosFns.zero,
    layerKey: "bg",
    getLayers: () => [
      { kind: "image", assetKey: "background", subLayer: "background" },
    ],
  }),
  ...makeTrees(
    20,
    [
      PosFns.new(0, 300),
      PosFns.new(500, 250),
      PosFns.new(750, 350),
      PosFns.new(100, 500),
    ],
    random
  ),
  ...makeTrees(
    20,
    [
      PosFns.new(881, 231),
      PosFns.new(1569, 196),
      PosFns.new(1837, 209),
      PosFns.new(1829, 361),
      PosFns.new(1309, 333),
    ],
    random
  ),
  makeSceneObject({
    layerKey: "person",
    position: PosFns.new(1260, 490),
    getLayers: () => [
      { kind: "image", assetKey: "personSitting", subLayer: "background" },
      { kind: "image", assetKey: "personHead", subLayer: "background" },
    ],
    onInteract: () => [{ kind: "show", target: speechBubble.id }],
  }),
  speechBubble,
];

const makeActions = (random: PRNG): Observable<SceneAction<LayerKey>> =>
  merge(timer(200), randomInterval([6000, 15000], random)).pipe(
    map(() => ({
      kind: "addObject",
      makeObject: () => makeCruisingBird("bird", -160, [10, 180], random),
    }))
  );

export const makeIntroScene = (random: PRNG) => ({
  objects: makeObjects(random),
  layerOrder,
  actions: makeActions(random),
});
