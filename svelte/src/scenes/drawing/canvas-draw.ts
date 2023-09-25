import { PosFns, breakText, type DrawLayer } from "../../model";

const lineHeight = 53;

export const drawLayerContent =
  (ctx: CanvasRenderingContext2D) =>
  (layer: DrawLayer): void => {
    const content = layer.content;

    ctx.save();
    ctx.setTransform();

    if (layer.shadow) {
      ctx.shadowColor = layer.shadow.color;
      ctx.shadowBlur = layer.shadow.blur;
    }

    if (content.kind === "image") {
      if (content.rotation) {
        const size = PosFns.new(content.image.width, content.image.height);
        const center = PosFns.add(layer.position, PosFns.scale(size, 0.5));

        ctx.translate(center.x, center.y);
        ctx.rotate((content.rotation * Math.PI) / 180);
        ctx.translate(-center.x, -center.y);
      }

      ctx.drawImage(content.image, layer.position.x, layer.position.y);
    } else if (content.kind === "text") {
      const measureText = (s: string) => ctx.measureText(s)?.width ?? 0;
      const lines = content.text.flatMap((t) =>
        breakText(t, content.maxWidth, measureText)
      );

      lines.forEach((line, index) => {
        const position = PosFns.add(
          layer.position,
          PosFns.new(0, index * lineHeight)
        );
        ctx.fillText(line, position.x, position.y);
      });
    } else {
      content.draw(ctx);
    }
    ctx.restore();
  };
