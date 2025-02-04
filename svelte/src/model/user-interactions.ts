import { z } from "zod";
import { positionSchema } from "./position";

export const userInteractionSchema = z
  .union([
    z.object({
      kind: z.literal("click"),
      position: positionSchema,
    }),
    z.object({
      kind: z.literal("pointermove"),
      position: positionSchema,
    }),
    z.object({
      kind: z.literal("pointerdown"),
    }),
    z.object({
      kind: z.literal("pointerup"),
    }),
  ])
  .readonly();

export type UserInteraction = z.infer<typeof userInteractionSchema>;
