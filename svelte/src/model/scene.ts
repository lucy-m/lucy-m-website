import { Observable, Subject, merge, type Subscription } from "rxjs";
import { partitionByAllKinds } from "../utils";
import type { Position } from "./position";
import { getObjectBoundingBox, getObjectsInOrder } from "./scene-object";
import {
  convertRemoveSelf,
  type SceneAction,
  type SceneEvent,
  type SceneEventInteract,
  type SceneEventOrAction,
  type SceneObject,
  type SceneSpec,
  type SceneType,
} from "./scene-types";

/**
 * Converts SceneEventInteract to actions.
 */
const interactToActions = (
  event: SceneEventInteract,
  objects: Readonly<SceneObject[]>,
  layerOrder: Readonly<string[]>,
  images: Record<string, ImageBitmap>
): SceneAction[] | undefined => {
  const getTopObjectAtLocation = (
    objects: Readonly<SceneObject[]>,
    position: Position
  ): SceneObject | undefined => {
    const objectsInOrder = getObjectsInOrder(
      objects,
      layerOrder,
      "top-to-bottom"
    );

    const interactObject = objectsInOrder.find((sceneObj) => {
      const boundingBox = getObjectBoundingBox(sceneObj, images);
      return (
        position.x >= boundingBox.topLeft.x &&
        position.x < boundingBox.bottomRight.x &&
        position.y >= boundingBox.topLeft.y &&
        position.y < boundingBox.bottomRight.y
      );
    });

    return interactObject;
  };

  if (event.interaction.kind === "click") {
    const position = event.interaction.position;

    const interactableObjects = objects.filter((obj) => obj.onInteract);

    const interactObject = getTopObjectAtLocation(
      interactableObjects,
      position
    );

    const objectActions = interactObject?.onInteract?.() ?? undefined;

    return objectActions;
  } else if (event.interaction.kind === "pointermove") {
    const position = event.interaction.position;

    const interactableObjects = objects.filter((obj) => obj.onPointerMove);

    const interactObject = getTopObjectAtLocation(
      interactableObjects,
      position
    );

    const objectActions = interactObject?.onPointerMove?.() ?? undefined;

    return objectActions;
  } else {
    // LTODO: Add in additional events
  }
};

export const makeSceneType =
  (
    scene: Pick<SceneType, "typeName" | "layerOrder" | "onObjectEvent"> & {
      objects: readonly SceneObject[];
      events: Observable<SceneEventOrAction>;
      onDestroy?: () => void;
    }
  ) =>
  (
    images: Record<string, ImageBitmap>,
    onSceneChange: (newScene: SceneSpec) => void
  ): SceneType => {
    let objects: SceneObject[] = [];
    let eventSubscriptions: Record<string, Subscription> = {};
    const externalEvents = new Subject<SceneEvent>();
    const objectSceneActions = new Subject<SceneAction>();

    const applySceneEvent = (event: SceneEventOrAction): void => {
      if (event.kind === "tick") {
        const tickActions = objects.flatMap((obj) => {
          if (obj.onTick) {
            return (obj.onTick() ?? []).map(convertRemoveSelf(obj.id));
          } else {
            return [];
          }
        });

        applySceneActions(tickActions);
      } else if (event.kind === "interact") {
        const objectActions = interactToActions(
          event,
          objects,
          scene.layerOrder,
          images
        );

        if (objectActions) {
          applySceneActions(objectActions);
        }
      } else {
        applySceneActions([event]);
      }
    };

    const applySceneActions = (actions: readonly SceneAction[]): void => {
      const byType = partitionByAllKinds(actions);

      const changeSceneAction = byType.changeScene?.[0];
      if (changeSceneAction) {
        onSceneChange(changeSceneAction.newScene);
      }

      const addedObjects =
        byType.addObject?.map(({ makeObject }) => makeObject()) ?? [];
      const removedIds = new Set(
        byType.removeObject?.map(({ target }) => target) ?? []
      );

      byType.emitEvent?.forEach(
        ({ event }) => scene.onObjectEvent && scene.onObjectEvent(event)
      );
      addedObjects.forEach((obj) => addObject(obj));
      removedIds.forEach((id) => removeObject(id));
    };

    const onExternalEvent = (event: SceneEvent) => externalEvents.next(event);

    const eventsSub = merge(
      objectSceneActions,
      scene.events,
      externalEvents
    ).subscribe((action) => {
      applySceneEvent(action);
    });

    const getObjects = () => objects;
    const addObject = (obj: SceneObject) => {
      if (!objects.find((so) => so.id === obj.id)) {
        if (obj.events$) {
          const subscription = obj.events$.subscribe((event) => {
            if (event.kind === "emitEvent") {
              scene.onObjectEvent && scene.onObjectEvent(event.event);
            } else {
              objectSceneActions.next(convertRemoveSelf(obj.id)(event));
            }
          });
          eventSubscriptions[obj.id] = subscription;
        }
        if (obj.onAddedToScene) {
          const actions = obj.onAddedToScene();
          if (actions) {
            applySceneActions(actions);
          }
        }
        objects.push(obj);
      }
    };

    const removeObject = (id: string) => {
      const onDestroy = objects.find((obj) => obj.id === id)?.onDestroy;
      onDestroy && onDestroy();
      objects = objects.filter((obj) => obj.id !== id);

      const sub = eventSubscriptions[id];
      sub?.unsubscribe();
      delete eventSubscriptions[id];
    };

    const destroy = () => {
      scene.onDestroy && scene.onDestroy();
      Object.values(eventSubscriptions).forEach((sub) => sub.unsubscribe());
      eventsSub.unsubscribe();
    };

    scene.objects.forEach(addObject);

    return {
      ...scene,
      getObjects,
      addObject,
      removeObject,
      destroy,
      onExternalEvent,
    };
  };
