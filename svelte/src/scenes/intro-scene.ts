import {
  PosFns,
  makeSceneObject,
  makeSceneObjectStateful,
  type SceneObject,
  type SceneObjectStateless,
  type SceneType,
} from "../model";
import type { AssetKey } from "../model/assets";
import { generatePointsInShape, type Shape } from "../model/shape";

type LayerKey = "bg" | "person" | "speechBubble" | "trees";

const layerOrder: LayerKey[] = ["bg", "trees", "person", "speechBubble"];

const randomTree = (): AssetKey => {
  const r = Math.random() * 3;

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
  shape: Shape
): SceneObjectStateless<LayerKey>[] => {
  return generatePointsInShape(target, shape)
    .sort((a, b) => a.y - b.y)
    .map<SceneObjectStateless<LayerKey>>((position) => {
      const assetKey = randomTree();

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

const objects: SceneObject<LayerKey, any>[] = [
  makeSceneObject({
    position: PosFns.zero,
    layerKey: "bg",
    getLayers: () => [
      { kind: "image", assetKey: "background", subLayer: "background" },
    ],
  }),
  // ...makeTrees(20, [
  //   PosFns.new(0, 300),
  //   PosFns.new(500, 250),
  //   PosFns.new(750, 350),
  //   PosFns.new(100, 500),
  // ]),
  // ...makeTrees(20, [
  //   PosFns.new(881, 231),
  //   PosFns.new(1569, 196),
  //   PosFns.new(1837, 209),
  //   PosFns.new(1829, 361),
  //   PosFns.new(1309, 333),
  // ]),
  makeSceneObject({
    layerKey: "person",
    position: PosFns.new(1260, 490),
    getLayers: () => [
      { kind: "image", assetKey: "personSitting", subLayer: "background" },
      { kind: "image", assetKey: "personHead", subLayer: "background" },
    ],
  }),
  makeSceneObject({
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
    onInteract: (current) =>
      current.hidden
        ? [
            {
              kind: "show",
            },
          ]
        : [{ kind: "hide" }],
  }),
  makeSceneObjectStateful<"bg", { up: boolean }>({
    layerKey: "bg",
    position: PosFns.new(50, 100),
    state: { up: true },
    getLayers: () => [
      {
        kind: "image",
        assetKey: "birdFlapUp",
        subLayer: "background",
      },
    ],
    onTick: (current) => {
      if (current.position.x > 800) {
        return [
          { kind: "moveTo", to: PosFns.new(50, 100) },
          { kind: "updateState", state: { up: !current.state.up } },
        ];
      } else {
        return [
          { kind: "moveBy", by: PosFns.new(10, current.state.up ? -2 : 2) },
        ];
      }
    },
  }),
];

export const introScene: SceneType<LayerKey> = {
  objects,
  layerOrder,
};
