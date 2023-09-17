import {
  Observable,
  Subject,
  Subscription,
  filter,
  finalize,
  interval,
  map,
  merge,
  startWith,
  switchMap,
  tap,
} from "rxjs";
import seedrandom from "seedrandom";
import { sceneSize } from "..";
import {
  rafThrottle,
  resolveScene,
  type AssetKey,
  type Destroyable,
  type Position,
  type SceneType,
} from "../../model";
import type { SceneEvent, SceneSpec } from "../../model/scene-types";
import { drawLayerContent } from "./canvas-draw";

const redrawCanvas = (
  ctx: CanvasRenderingContext2D,
  scene: SceneType,
  images: Record<AssetKey, HTMLImageElement>
) => {
  if (ctx) {
    ctx.clearRect(0, 0, sceneSize.x, sceneSize.y);

    const drawLayers = resolveScene(scene, images);

    const drawLayerBound = drawLayerContent(ctx);

    drawLayers.forEach(drawLayerBound);
  }
};

export const viewScene = (
  canvas: HTMLCanvasElement,
  args: {
    initialSceneSpec: SceneSpec;
    images: Record<AssetKey, HTMLImageElement>;
    onSceneChange?: (scene: SceneType) => void;
    worldClick$?: Observable<Position>;
    seed: string;
  }
): Destroyable => {
  const { initialSceneSpec, images, onSceneChange, worldClick$, seed } = args;

  const interactSub = new Subject<Position>();

  canvas.width = sceneSize.x;
  canvas.height = sceneSize.y;
  canvas.onclick = (e) => {
    const x = e.offsetX * (canvas.width / canvas.clientWidth);
    const y = e.offsetY * (canvas.height / canvas.clientHeight);

    interactSub.next({ x, y });
  };

  const ctx = canvas.getContext("2d");

  const prng = seedrandom(seed);

  let subscription: Subscription | undefined;

  if (ctx) {
    ctx.font = "42px Quicksand";

    const changeSceneSub = new Subject<SceneSpec>();
    const onNewScene = (newScene: SceneSpec) => {
      changeSceneSub.next(newScene);
    };

    subscription = changeSceneSub
      .pipe(
        startWith(initialSceneSpec),
        map((sceneSpec) => sceneSpec(prng)(images, onNewScene)),
        tap((currentScene) => {
          redrawCanvas(ctx, currentScene, images);
          onSceneChange && onSceneChange(currentScene);
          canvas.setAttribute("data-initialised", "true");
        }),
        switchMap((currentScene) =>
          merge(
            interval(30)
              .pipe(map(() => ({ kind: "tick" } as SceneEvent)))
              .pipe(filter(() => document.hasFocus())),
            (worldClick$ ? merge(interactSub, worldClick$) : interactSub).pipe(
              map(
                (position: Position) =>
                  ({ kind: "interact", position } as SceneEvent)
              )
            )
          ).pipe(
            finalize(() => currentScene.destroy()),
            tap((event) => currentScene.onExternalEvent(event)),
            tap(() => {
              onSceneChange && onSceneChange(currentScene);
            }),
            rafThrottle(),
            tap(() => {
              redrawCanvas(ctx, currentScene, images);
            })
          )
        )
      )
      .subscribe();
  }

  return {
    destroy: () => {
      canvas.removeAttribute("data-initialised");
      subscription?.unsubscribe();
    },
  };
};
