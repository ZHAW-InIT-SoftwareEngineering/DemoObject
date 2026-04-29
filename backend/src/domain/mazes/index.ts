import type { Maze } from "../maze";
import { maze0 } from "./maze0";
import { maze1 } from "./maze1";
import { maze2 } from "./maze2";
import { maze3 } from "./maze3";

export const mazes = {
  [maze0.mazeId]: maze0,
  [maze1.mazeId]: maze1,
  [maze2.mazeId]: maze2,
  [maze3.mazeId]: maze3,
} satisfies Record<number, Maze>;
