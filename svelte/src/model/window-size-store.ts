import { readable } from "svelte/store";

export interface WindowSize {
  width: number;
  height: number;
}

export const makeWindowSizeStore = () =>
  readable<WindowSize>(
    { width: window.innerWidth, height: window.innerHeight },
    (set) => {
      const r = new ResizeObserver(() => {
        window.requestAnimationFrame(() => {
          set({ width: window.innerWidth, height: window.innerHeight });
        });
      });

      r.observe(document.body);

      return () => r.disconnect();
    }
  );
