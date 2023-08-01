import { Subject, share, startWith, tap, type Observable } from "rxjs";
import { readable } from "svelte/store";

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

export const makeElementSizeStore = (element: HTMLElement) =>
  readable<ElementSize>(
    {
      clientWidth: element.clientWidth,
      clientHeight: element.clientHeight,
      scrollHeight: element.scrollHeight,
    },
    (set) => {
      const r = new ResizeObserver(() => {
        window.requestAnimationFrame(() => {
          set({
            clientWidth: element.clientWidth,
            clientHeight: element.clientHeight,
            scrollHeight: element.scrollHeight,
          });
        });
      });

      r.observe(element);

      return () => r.disconnect();
    }
  );
