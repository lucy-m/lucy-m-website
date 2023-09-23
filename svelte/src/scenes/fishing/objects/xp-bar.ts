import type { Observable } from "rxjs";
import type { PRNG } from "seedrandom";
import {
  makeSceneObject,
  NumberSpringFns,
  PosFns,
  type SceneObject,
} from "../../../model";
import { sceneSize } from "../../scene-size";

export const makeXpBar = (args: {
  random: PRNG;
  fillFrac$: Observable<number>;
}): SceneObject => {
  const height = 50;
  const width = 750;
  const margin = 40;
  const outlineWidth = 4;
  const label = "XP";

  let fillFracSpring = NumberSpringFns.make({
    endPoint: 0,
    position: 0,
    velocity: 0,
    properties: {
      friction: 15,
      precision: 0.01,
      stiffness: 1.1,
      weight: 0.05,
    },
  });

  const sub = args.fillFrac$.subscribe((fillFrac) => {
    fillFracSpring = NumberSpringFns.set(fillFracSpring, {
      endPoint: fillFrac,
    });
  });

  return makeSceneObject(args.random)({
    layerKey: "xp-bar",
    typeName: "xp-bar",
    getPosition: () => PosFns.zero,
    getLayers: () => [
      {
        kind: "ctxDraw",
        draw: (ctx) => {
          const labelSize = ctx.measureText(label);

          const leftMargin = margin + labelSize.width + 16;

          ctx.fillStyle = "hsl(0, 0%, 20%)";
          ctx.fillRect(
            leftMargin,
            sceneSize.y - margin - height,
            width,
            height
          );

          const gradient = ctx.createLinearGradient(
            leftMargin,
            0,
            leftMargin + width,
            0
          );
          gradient.addColorStop(0, "hsl(290, 60%, 30%");
          gradient.addColorStop(0.2, "hsl(240, 60%, 60%");
          gradient.addColorStop(0.45, "hsl(180, 50%, 45%");
          gradient.addColorStop(0.6, "hsl(110, 50%, 50%)");
          gradient.addColorStop(0.8, "hsl(40, 60%, 60%)");
          gradient.addColorStop(1, "hsl(0, 60%, 60%)");

          ctx.fillStyle = gradient;

          const frac = Math.min(Math.max(fillFracSpring.position, 0), 1);

          ctx.fillRect(
            leftMargin,
            sceneSize.y - margin - height,
            width * frac,
            height
          );

          ctx.strokeStyle = "white";

          for (let i = 0; i < outlineWidth; i++) {
            ctx.strokeRect(
              leftMargin + i,
              sceneSize.y - margin - height + i,
              width - 2 * i,
              height - 2 * i
            );
          }

          ctx.fillStyle = "white";
          ctx.textBaseline = "middle";
          ctx.fillText(label, margin, sceneSize.y - margin - height / 2);
        },
        subLayer: "background",
      },
    ],
    onTick: () => {
      fillFracSpring = NumberSpringFns.tick(fillFracSpring, 0.1);
    },
    onDestroy: () => {
      sub.unsubscribe();
    },
    _getDebugInfo: () => ({
      fillFracSpring,
    }),
  });
};
