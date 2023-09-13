import { PosFns, breakText, type DrawLayer } from "../../model";

const lineHeight = 53;

export const drawLayerContent =
  (ctx: CanvasRenderingContext2D) =>
  (layer: DrawLayer): void => {
    const content = layer.content;

    if (content.kind === "image") {
      ctx?.drawImage(content.image, layer.position.x, layer.position.y);
    } else {
      const measureText = (s: string) => ctx?.measureText(s)?.width ?? 0;
      const lines = content.text.flatMap((t) =>
        breakText(t, content.maxWidth, measureText)
      );

      lines.forEach((line, index) => {
        const position = PosFns.add(
          layer.position,
          PosFns.new(0, index * lineHeight)
        );
        ctx?.fillText(line, position.x, position.y);
      });
    }
  };
