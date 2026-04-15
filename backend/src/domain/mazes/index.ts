import type { Maze } from "../maze";
import { maze0 } from "./maze0";
import { maze1 } from "./maze1";

export const mazes = {
  [maze0.mazeId]: maze0,
  [maze1.mazeId]: maze1,
} satisfies Record<number, Maze>;
