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
} from "rxjs";
import {
  PosFns,
  applySceneEvent,
  breakText,
  rafThrottle,
  resolveScene,
  type AssetKey,
  type Position,
  type SceneAction,
  type SceneEvent,
  type SceneType,
} from "../../model";
import { sceneSize } from "../../scenes";

const lineHeight = 53;

const redrawCanvas = (
  ctx: CanvasRenderingContext2D,
  scene: SceneType<string>,
  images: Record<AssetKey, HTMLImageElement>
) => {
  if (ctx) {
    ctx.clearRect(0, 0, sceneSize.x, sceneSize.y);

    const drawLayers = resolveScene(scene, images);

    drawLayers.forEach((layer) => {
      const content = layer.content;

      if (content.kind === "image") {
        ctx?.drawImage(content.image, layer.position.x, layer.position.y);
      } else {
        const measureText = (s: string) => ctx?.measureText(s)?.width ?? 0;
        const lines = content.text.flatMap((t) =>
          breakText(t, content.maxWidth, measureText)
        );

        lines.forEach((line, index) => {
          const position = PosFns.add(
            layer.position,
            PosFns.new(0, index * lineHeight)
          );
          ctx?.fillText(line, position.x, position.y);
        });
      }
    });
  }
};

export const viewScene = (
  canvas: HTMLCanvasElement,
  args: {
    initialScene: SceneType<string>;
    images: Record<AssetKey, HTMLImageElement>;
  }
) => {
  const { initialScene, images } = args;

  const interactSub = new Subject<Position>();
  const eventsSub = new Subject<Observable<SceneEvent | SceneAction<string>>>();

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

    subscription = merge(
      interval(30).pipe(map(() => ({ kind: "tick" } as SceneEvent))),
      interactSub.pipe(
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
          }
          return sceneEventResult.scene;
        }, initialScene),
        rafThrottle(),
        startWith(initialScene)
      )
      .subscribe((scene) => {
        redrawCanvas(ctx, scene, images);
      });
  }

  return {
    destroy: () => {
      subscription?.unsubscribe();
    },
  };
};
