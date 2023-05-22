export interface Position {
  x: number;
  y: number;
}

export const p = (x: number, y: number): Position => ({ x, y });
