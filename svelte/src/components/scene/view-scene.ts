import {
  Subject,
  Subscription,
  filter,
  interval,
  map,
  merge,
  scan,
  startWith,
} from "rxjs";
import {
  PosFns,
  applySceneAction,
  breakText,
  rafThrottle,
  resolveScene,
  type AssetKey,
  type Position,
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
): SvelteActionReturnType => {
  const { initialScene, images } = args;

  const interactSub = new Subject<Position>();

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
      initialScene.actions
    )
      .pipe(
        filter(() => document.hasFocus()),
        scan((scene, action) => {
          return applySceneAction(scene, images, action);
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
