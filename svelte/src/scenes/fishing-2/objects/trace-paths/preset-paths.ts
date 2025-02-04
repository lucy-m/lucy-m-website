import type { PRNG } from "seedrandom";
import { PosFns, type Position } from "../../../../model";
import { makeTracePath } from "./trace-path";

const fishPositions: Position[] = [
  PosFns.new(484, 291),
  PosFns.new(440, 224),
  PosFns.new(379, 167),
  PosFns.new(314, 108),
  PosFns.new(246, 76),
  PosFns.new(152, 66),
  PosFns.new(76, 96),
  PosFns.new(36, 160),
  PosFns.new(44, 235),
  PosFns.new(99, 293),
  PosFns.new(182, 300),
  PosFns.new(255, 273),
  PosFns.new(319, 229),
  PosFns.new(431, 95),
  PosFns.new(488, 30),
];

export const presetPaths = {
  fish: (args: { random: PRNG; position: Position }) =>
    makeTracePath({
      random: args.random,
      position: args.position,
      markerPositions: fishPositions,
      background: "pathFish",
    }),
};
