import {
  Observable,
  Subject,
  Subscription,
  filter,
  interval,
  map,
  merge,
  scan,
  startWith,
  switchMap,
  tap,
} from "rxjs";
import { sceneSize } from "..";
import {
  applySceneEvent,
  rafThrottle,
  resolveScene,
  type AssetKey,
  type Destroyable,
  type Position,
  type SceneAction,
  type SceneEvent,
  type SceneType,
} from "../../model";
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
    initialScene: SceneType;
    images: Record<AssetKey, HTMLImageElement>;
    onSceneChange?: (s: SceneType) => void;
    worldClick$?: Observable<Position>;
  }
): Destroyable => {
  const { initialScene, images, onSceneChange, worldClick$ } = args;

  const interactSub = new Subject<Position>();
  const eventsSub = new Subject<Observable<SceneEvent | SceneAction>>();

  canvas.width = sceneSize.x;
  canvas.height = sceneSize.y;
  canvas.onclick = (e) => {
    const x = e.offsetX * (canvas.width / canvas.clientWidth);
    const y = e.offsetY * (canvas.height / canvas.clientHeight);

    interactSub.next({ x, y });
  };

  const ctx = canvas.getContext("2d");

  let subscription: Subscription | undefined;

  if (ctx) {
    ctx.font = "42px Quicksand";

    onSceneChange && onSceneChange(initialScene);

    subscription = merge(
      interval(30).pipe(map(() => ({ kind: "tick" } as SceneEvent))),
      (worldClick$ ? merge(interactSub, worldClick$) : interactSub).pipe(
        map(
          (position: Position) => ({ kind: "interact", position } as SceneEvent)
        )
      ),
      eventsSub.pipe(
        startWith(initialScene.events),
        switchMap((v) => v)
      )
    )
      .pipe(
        filter(() => document.hasFocus()),
        scan((scene, action) => {
          const sceneEventResult = applySceneEvent(scene, images, action);
          if (sceneEventResult.kind === "newScene") {
            eventsSub.next(sceneEventResult.scene.events);
            return sceneEventResult.scene;
          }
          return scene;
        }, initialScene),
        tap((scene) => {
          onSceneChange && onSceneChange(scene);
        }),
        rafThrottle(),
        startWith(initialScene)
      )
      .subscribe((scene) => {
        redrawCanvas(ctx, scene, images);
        canvas.setAttribute("data-initialised", "true");
      });
  }

  return {
    destroy: () => {
      canvas.removeAttribute("data-initialised");
      subscription?.unsubscribe();
    },
  };
};
