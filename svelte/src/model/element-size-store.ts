import { Subject, share, startWith, tap, type Observable } from "rxjs";

export interface ElementSize {
  clientWidth: number;
  clientHeight: number;
  scrollHeight: number;
}

export const observeElementSize = (
  element: HTMLElement
): Observable<ElementSize> => {
  const sub = new Subject<ElementSize>();

  const r = new ResizeObserver(() => {
    window.requestAnimationFrame(() => {
      sub.next({
        clientWidth: element.clientWidth,
        clientHeight: element.clientHeight,
        scrollHeight: element.scrollHeight,
      });
    });
  });

  r.observe(element);

  return sub.pipe(
    startWith({
      clientWidth: element.clientWidth,
      clientHeight: element.clientHeight,
      scrollHeight: element.scrollHeight,
    }),
    tap({
      complete: () => {
        r.disconnect();
      },
    }),
    share()
  );
};
