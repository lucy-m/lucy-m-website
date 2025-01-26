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
  withLatestFrom,
} from "rxjs";
import seedrandom from "seedrandom";
import { sceneSize } from "..";
import {
  rafThrottle,
  resolveScene,
  type AssetKey,
  type Destroyable,
  type SceneType,
} from "../../model";
import type {
  SceneEvent,
  SceneSpec,
  SvelteComponentMounter,
} from "../../model/scene-types";
import type { UserInteraction } from "../../model/user-interactions";
import { drawLayerContent } from "./canvas-draw";
import { setUpCanvasEvents } from "./set-up-canvas-events";

const redrawCanvas = (
  ctx: CanvasRenderingContext2D,
  scene: SceneType,
  images: Record<AssetKey, ImageBitmap>
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
    images: Record<AssetKey, ImageBitmap>;
    onSceneChange?: (scene: SceneType) => void;
    seed: string;
    mountSvelteComponent: SvelteComponentMounter;
    userInteractions$?: Observable<UserInteraction>;
    worldDisabled$: Observable<boolean>;
    tick$?: Observable<unknown>;
  }
): Destroyable => {
  const { initialSceneSpec, images, onSceneChange, userInteractions$, seed } =
    args;

  canvas.width = sceneSize.x;
  canvas.height = sceneSize.y;
  const interactSub = setUpCanvasEvents(canvas);

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
        map((sceneSpec) =>
          sceneSpec({
            random: prng,
            mountSvelteComponent: args.mountSvelteComponent,
          })(images, onNewScene)
        ),
        tap((currentScene) => {
          redrawCanvas(ctx, currentScene, images);
          onSceneChange && onSceneChange(currentScene);
          canvas.setAttribute("data-initialised", "true");
        }),
        switchMap((currentScene) =>
          merge(
            (args.tick$ ?? interval(30)).pipe(
              map(() => ({ kind: "tick" } as SceneEvent))
            ),
            (userInteractions$
              ? merge(interactSub, userInteractions$)
              : interactSub
            ).pipe(
              map(
                (interaction) =>
                  ({ kind: "interact", interaction } as SceneEvent)
              )
            )
          ).pipe(
            finalize(() => currentScene.destroy()),
            withLatestFrom(args.worldDisabled$),
            filter(([_event, disabled]) => !disabled),
            tap(([event]) => currentScene.onExternalEvent(event)),
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
