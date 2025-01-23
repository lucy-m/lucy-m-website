import { z } from "zod";

export const imageAndAltSchema = z.object({
  src: z.string(),
  alt: z.string(),
});

export type ImageAndAlt = z.infer<typeof imageAndAltSchema>;
