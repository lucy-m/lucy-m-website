import { Observable, map, merge, timer } from "rxjs";
import { type PRNG } from "seedrandom";
import {
  PosFns,
  generatePointsInShape,
  makeSceneObjectStateless,
  makeSceneTypeStateless,
  randomInterval,
  type SceneAction,
  type SceneObject,
  type SceneObjectStateless,
  type SceneType,
  type Shape,
} from "../model";
import type { AssetKey } from "../model/assets";
import { type ObjectLayerContent } from "../model/scene-types";
import { makeHouseScene } from "./house-scene";
import { makeCruisingBird } from "./objects/cruising-bird";

const layerOrder = [
  "bg",
  "trees",
  "house",
  "bird",
  "person",
  "speechBubble",
] as const;

type LayerKey = (typeof layerOrder)[number];

export const makeIntroScene = (random: PRNG): SceneType<LayerKey> => {
  const makeSceneObjectBound = makeSceneObjectStateless(random);

  const randomTree = (): AssetKey => {
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
    shape: Shape
  ): SceneObjectStateless<LayerKey> => {
    const layers: ObjectLayerContent[] = generatePointsInShape(
      target,
      shape,
      random
    )
      .sort((a, b) => a.y - b.y)
      .map((position) => ({
        kind: "image",
        assetKey: randomTree(),
        subLayer: "background",
        position,
      }));

    return makeSceneObjectBound({
      position: PosFns.zero,
      layerKey: "trees",
      getLayers: () => layers,
    });
  };

  const speechBubble = makeSceneObjectBound({
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
    onInteract: () => [{ kind: "hide" }],
  });

  const objects: SceneObject<LayerKey, any>[] = [
    makeSceneObjectBound({
      position: PosFns.zero,
      layerKey: "bg",
      getLayers: () => [
        { kind: "image", assetKey: "background", subLayer: "background" },
      ],
    }),
    makeTrees(20, [
      PosFns.new(0, 300),
      PosFns.new(500, 250),
      PosFns.new(750, 300),
      PosFns.new(0, 400),
    ]),
    makeTrees(20, [
      PosFns.new(881, 231),
      PosFns.new(1569, 196),
      PosFns.new(1837, 209),
      PosFns.new(1829, 361),
      PosFns.new(1309, 333),
    ]),
    makeSceneObjectBound({
      layerKey: "house",
      typeName: "small-house",
      position: PosFns.new(285, 355),
      getLayers: () => [
        { kind: "image", assetKey: "houseSmall", subLayer: "background" },
      ],
      onInteract: () => [
        {
          kind: "sceneAction",
          action: {
            kind: "changeScene",
            makeScene: () => makeHouseScene(random),
          },
        },
      ],
    }),
    makeSceneObjectBound({
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

  const events: Observable<SceneAction<LayerKey>> = merge(
    timer(200),
    randomInterval([6000, 15000], random)
  ).pipe(
    map(() => ({
      kind: "addObject",
      makeObject: () => makeCruisingBird("bird", -160, [10, 180], random),
    }))
  );

  return makeSceneTypeStateless({
    typeName: "intro-scene",
    objects,
    layerOrder,
    events,
  });
};
