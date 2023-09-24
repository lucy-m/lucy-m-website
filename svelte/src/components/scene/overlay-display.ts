import {
  BehaviorSubject,
  Observable,
  map,
  share,
  startWith,
  withLatestFrom,
} from "rxjs";
import type { ComponentType } from "svelte";
import { makeNumberSpring } from "../../model";

export type OverlayComponent = { component: ComponentType; props: object };

export interface OverlayDisplayState {
  overlayComponent: OverlayComponent | undefined;
  worldDisabled: boolean;
  inOutValue: number;
}

export interface OverlayDisplay {
  state$: Observable<OverlayDisplayState>;
  show: (component: OverlayComponent) => void;
  hide: () => void;
}

export const makeOverlayDisplay = (): OverlayDisplay => {
  const showHideSub = new BehaviorSubject<
    { kind: "show"; component: OverlayComponent } | { kind: "hide" }
  >({ kind: "hide" });

  const state$: Observable<OverlayDisplayState> = makeNumberSpring(
    {
      endPoint: 0,
      position: 0,
      velocity: 0,
      properties: {
        friction: 6,
        precision: 0.01,
        stiffness: 1,
        weight: 8,
        clampValue: true,
      },
    },
    showHideSub.pipe(
      map((showHide) => {
        return {
          kind: "set",
          set: {
            endPoint: showHide.kind === "show" ? 1 : 0,
          },
        };
      })
    )
  ).pipe(
    withLatestFrom(showHideSub),
    map(([spring, showHide]) => {
      const worldDisabled = !spring.stationary || spring.endPoint === 1;
      const overlayComponent =
        showHide.kind === "show" ? showHide.component : undefined;
      const inOutValue = spring.position;

      return { worldDisabled, overlayComponent, inOutValue };
    }),
    startWith({
      worldDisabled: false,
      inOutValue: 0,
      overlayComponent: undefined,
    }),
    share()
  );

  const show = (component: OverlayComponent) => {
    showHideSub.next({ kind: "show", component });
  };

  const hide = () => {
    showHideSub.next({ kind: "hide" });
  };

  return { state$, show, hide };
};
