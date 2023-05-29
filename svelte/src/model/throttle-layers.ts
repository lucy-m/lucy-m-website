import { concat, concatMap, delay, of, type Observable } from "rxjs";
import type { Layer } from "./layer";

export const throttleLayers = <TLayerKey>(
  images: Layer<TLayerKey>[]
): Observable<Layer<TLayerKey>> => {
  const baseTime = 200;
  const timeDecrement = 100;
  const minTime = 20;

  interface Accumulator {
    imageDelays: Map<HTMLImageElement, number>;
    throttled: Observable<Layer<TLayerKey>>[];
  }

  const initial: Accumulator = {
    imageDelays: new Map(),
    throttled: [],
  };

  const throttled = images.reduce<Accumulator>((acc, next) => {
    if (next.content.kind === "image") {
      const imageDelay = Math.max(
        (acc.imageDelays.get(next.content.image) ?? baseTime) - timeDecrement,
        minTime
      );

      const imageDelays = acc.imageDelays.set(next.content.image, imageDelay);
      const throttled = [...acc.throttled, of(next).pipe(delay(imageDelay))];

      return { imageDelays, throttled };
    } else {
      return {
        imageDelays: acc.imageDelays,
        throttled: [...acc.throttled, of(next).pipe(delay(baseTime))],
      };
    }
  }, initial);

  const baseDataSource: Observable<Layer<TLayerKey>> = concat(
    throttled.throttled
  ).pipe(concatMap((v) => v));

  return baseDataSource;
};
