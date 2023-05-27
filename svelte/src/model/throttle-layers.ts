import { from, map, of, switchMap, timer, zip, type Observable } from "rxjs";
import type { Layer } from "./layer";

export const throttleLayers = <TLayerKey>(
  images: Layer<TLayerKey>[]
): Observable<Layer<TLayerKey>> => {
  const baseDataSource: Observable<Layer<TLayerKey>> = of(images).pipe(
    switchMap((images) => {
      return zip(from(images), timer(0, 100)).pipe(map(([image]) => image));
    })
  );

  return baseDataSource;
};
