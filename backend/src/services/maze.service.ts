import type { Maze, MazeId } from "../domain/maze";
import { mazes } from "../domain/maze";

export function getMazeById(mazeId: MazeId): Maze {
  if (!mazes[mazeId]) {
    console.error("Maze not found!");
    return null;
  } else {
     return mazes[mazeId];
  }
};
