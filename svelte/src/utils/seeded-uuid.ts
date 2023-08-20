import type { PRNG } from "seedrandom";
import { v4 as uuid } from "uuid";

export const seededUuid = (random: PRNG) => {
  const makeByte = () => Math.abs(random.int32()) % 256;
  const bytes = Array.from({ length: 16 }).map(() => makeByte());
  return uuid({ random: bytes });
};
