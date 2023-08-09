import {
  Subject,
  Subscription,
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
  type SceneAction,
  type SceneType,
} from "../../model";

const imageWidth = 1920;
const imageHeight = 1080;

const lineHeight = 53;

const redrawCanvas = (
  ctx: CanvasRenderingContext2D,
  scene: SceneType<string>,
  images: Record<AssetKey, HTMLImageElement>
) => {
  if (ctx) {
    ctx.clearRect(0, 0, imageWidth, imageHeight);

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

  canvas.width = imageWidth;
  canvas.height = imageHeight;
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
      interval(30).pipe(map(() => ({ kind: "tick" } as SceneAction))),
      interactSub.pipe(
        map(
          (position: Position) =>
            ({ kind: "interact", position } as SceneAction)
        )
      )
    )
      .pipe(
        scan(
          (scene, action) => applySceneAction(scene, images, action),
          initialScene
        ),
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
