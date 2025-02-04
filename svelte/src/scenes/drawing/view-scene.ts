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
    seed: string;
    mountSvelteComponent: SvelteComponentMounter;
    worldDisabled$: Observable<boolean>;
    _test?: {
      tick$?: Observable<unknown>;
      reload$?: Observable<unknown>;
      userInteractions$?: Observable<UserInteraction>;
      onSceneChange?: (scene: SceneType) => void;
    };
  }
): Destroyable => {
  const { initialSceneSpec, images, seed, _test } = args;

  canvas.width = sceneSize.x;
  canvas.height = sceneSize.y;
  const interactSub = setUpCanvasEvents(canvas);

  const ctx = canvas.getContext("2d");

  const prng = seedrandom(seed);

  const subscription = new Subscription();

  if (ctx) {
    ctx.font = "42px Quicksand";

    const changeSceneSub = new Subject<SceneSpec>();
    const onNewScene = (newScene: SceneSpec) => {
      changeSceneSub.next(newScene);
    };

    subscription.add(
      _test?.reload$?.subscribe(() => onNewScene(initialSceneSpec))
    );

    subscription.add(
      changeSceneSub
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

            _test?.onSceneChange?.(currentScene);
            canvas.setAttribute("data-initialised", "true");
          }),
          switchMap((currentScene) =>
            merge(
              (_test?.tick$ ?? interval(30)).pipe(
                map(() => ({ kind: "tick" } as SceneEvent))
              ),
              (_test?.userInteractions$
                ? merge(interactSub, _test?.userInteractions$)
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
                _test?.onSceneChange?.(currentScene);
              }),
              rafThrottle(),
              tap(() => {
                redrawCanvas(ctx, currentScene, images);
              })
            )
          )
        )
        .subscribe()
    );
  }

  return {
    destroy: () => {
      canvas.removeAttribute("data-initialised");
      subscription?.unsubscribe();
    },
  };
};
