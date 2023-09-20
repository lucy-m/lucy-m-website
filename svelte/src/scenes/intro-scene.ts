import { Observable, map, merge, timer } from "rxjs";
import {
  PosFns,
  generatePointsInShape,
  makeSceneObject,
  makeSceneType,
  randomInterval,
  type SceneAction,
  type SceneObject,
  type Shape,
} from "../model";
import type { AssetKey } from "../model/assets";
import type { ObjectLayerContent, SceneSpec } from "../model/scene-types";
import { makeHouseScene } from "./house-scene";
import { makeCruisingBird } from "./objects/cruising-bird";

const layerOrder = [
  "bg",
  "trees",
  "house",
  "person",
  "bird",
  "speechBubble",
] as const;

export const makeIntroScene: SceneSpec = ({ random }) => {
  const makeSceneObjectBound = makeSceneObject(random);

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

  const makeTrees = (target: number, shape: Shape): SceneObject => {
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
      getPosition: () => PosFns.zero,
      layerKey: "trees",
      getLayers: () => layers,
    });
  };

  const speechBubble = makeSceneObjectBound((id) => ({
    typeName: "speech-bubble",
    layerKey: "speechBubble",
    getPosition: () => PosFns.new(730, 260),
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
    onInteract: () => [{ kind: "removeObject", target: id }],
  }));

  const objects: SceneObject[] = [
    makeSceneObjectBound({
      getPosition: () => PosFns.zero,
      layerKey: "bg",
      getLayers: () => [
        { kind: "image", assetKey: "introBackground", subLayer: "background" },
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
      getPosition: () => PosFns.new(285, 355),
      getLayers: () => [
        { kind: "image", assetKey: "houseSmall", subLayer: "background" },
      ],
      onInteract: () => [
        {
          kind: "changeScene",
          newScene: makeHouseScene,
        },
      ],
    }),
    makeSceneObjectBound({
      typeName: "person",
      layerKey: "person",
      getPosition: () => PosFns.new(1260, 490),
      getLayers: () => [
        { kind: "image", assetKey: "personSitting", subLayer: "background" },
        { kind: "image", assetKey: "personHead", subLayer: "background" },
      ],
      onInteract: () => [
        {
          kind: "addObject",
          makeObject: () => speechBubble,
        },
      ],
    }),
    speechBubble,
  ];

  const events: Observable<SceneAction> = merge(
    timer(200),
    randomInterval([6000, 15000], random)
  ).pipe(
    map(() => ({
      kind: "addObject",
      makeObject: () => makeCruisingBird("bird", -160, [10, 180], random),
    }))
  );

  return makeSceneType({
    typeName: "intro-scene",
    objects,
    layerOrder,
    events,
  });
};
