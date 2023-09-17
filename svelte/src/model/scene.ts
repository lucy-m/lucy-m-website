import { Observable, Subject, merge, type Subscription } from "rxjs";
import { partitionByAllKinds } from "../utils";
import { getObjectBoundingBox, getObjectsInOrder } from "./scene-object";
import {
  type SceneAction,
  type SceneEvent,
  type SceneEventOrAction,
  type SceneObject,
  type SceneSpec,
  type SceneType,
} from "./scene-types";

export const makeSceneType =
  (
    scene: Pick<SceneType, "typeName" | "layerOrder" | "onObjectEvent"> & {
      objects: readonly SceneObject[];
      events: Observable<SceneEventOrAction>;
    }
  ) =>
  (
    images: Record<string, HTMLImageElement>,
    onSceneChange: (newScene: SceneSpec) => void
  ): SceneType => {
    let objects: SceneObject[] = [];
    let eventSubscriptions: Record<string, Subscription> = {};
    const externalEvents = new Subject<SceneEvent>();
    const objectSceneActions = new Subject<SceneAction>();

    const applySceneEvent = (event: SceneEventOrAction): void => {
      if (event.kind === "tick") {
        const tickActions = getObjects().flatMap((obj) => {
          if (obj.onTick) {
            return obj.onTick() ?? [];
          } else {
            return [];
          }
        });

        applySceneActions(tickActions);
      } else if (event.kind === "interact") {
        const objectsInOrder = getObjectsInOrder(
          getObjects().filter((obj) => obj.onInteract),
          scene.layerOrder,
          "top-to-bottom"
        );

        const interactObject = objectsInOrder.find((sceneObj) => {
          const boundingBox = getObjectBoundingBox(sceneObj, images);
          return (
            event.position.x >= boundingBox.topLeft.x &&
            event.position.x < boundingBox.bottomRight.x &&
            event.position.y >= boundingBox.topLeft.y &&
            event.position.y < boundingBox.bottomRight.y
          );
        });

        if (!interactObject) {
          return;
        }

        const objectActions =
          interactObject.onInteract && interactObject.onInteract();

        if (!objectActions) {
          return;
        } else {
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
              objectSceneActions.next(event);
            }
          });
          eventSubscriptions[obj.id] = subscription;
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
