import { Subject, type Observable } from "rxjs";
import type { Position } from "../../model";
import type { UserInteraction } from "../../model/user-interactions";

/**
 * Adds event listeners to canvas that outputs to the provided Observable.
 * Make sure canvas.width has been set before calling.
 *
 * @param canvas
 */
export const setUpCanvasEvents = (
  canvas: HTMLCanvasElement
): Observable<UserInteraction> => {
  const interactSub = new Subject<UserInteraction>();

  const convertOffsetPosition = (
    offsetX: number,
    offsetY: number
  ): Position => {
    const x = offsetX * (canvas.width / canvas.clientWidth);
    const y = offsetY * (canvas.height / canvas.clientHeight);

    return { x, y };
  };

  canvas.addEventListener("click", (e) => {
    const position = convertOffsetPosition(e.offsetX, e.offsetY);

    console.debug("Clicked at position", position);

    interactSub.next({ kind: "click", position });
  });

  canvas.addEventListener("pointermove", (e) => {
    const position = convertOffsetPosition(e.offsetX, e.offsetY);

    interactSub.next({ kind: "pointermove", position });
  });

  canvas.addEventListener("pointerdown", () => {
    interactSub.next({ kind: "pointerdown" });
  });

  canvas.addEventListener("pointerup", () => {
    interactSub.next({ kind: "pointerup" });
  });

  return interactSub;
};
