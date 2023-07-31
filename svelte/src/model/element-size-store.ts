import { readable } from "svelte/store";

export interface ElementSize {
  clientWidth: number;
  clientHeight: number;
  scrollHeight: number;
}

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
