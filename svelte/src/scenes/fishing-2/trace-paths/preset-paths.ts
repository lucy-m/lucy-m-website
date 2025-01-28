import type { PRNG } from "seedrandom";
import { PosFns, type Position } from "../../../model";
import { makeTracePath } from "./trace-path";

const fishPositions: Position[] = [
  PosFns.new(578, 535),
  PosFns.new(530, 464),
  PosFns.new(469, 407),
  PosFns.new(404, 348),
  PosFns.new(326, 316),
  PosFns.new(242, 306),
  PosFns.new(166, 336),
  PosFns.new(126, 400),
  PosFns.new(136, 479),
  PosFns.new(200, 532),
  PosFns.new(278, 528),
  PosFns.new(348, 499),
  PosFns.new(413, 458),
  PosFns.new(521, 335),
  PosFns.new(578, 270),
].map((x) => PosFns.add(PosFns.new(-40, -40), x));

export const presetPaths = {
  fish: (random: PRNG) => makeTracePath({ random, positions: fishPositions }),
};
