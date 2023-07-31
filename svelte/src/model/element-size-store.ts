import { readable } from "svelte/store";

export interface ElementSize {
  width: number;
  height: number;
}

export const makeElementSizeStore = (element: HTMLElement) =>
  readable<ElementSize>(
    { width: element.clientWidth, height: element.clientHeight },
    (set) => {
      const r = new ResizeObserver(() => {
        window.requestAnimationFrame(() => {
          set({ width: element.clientWidth, height: element.clientHeight });
        });
      });

      r.observe(element);

      return () => r.disconnect();
    }
  );
