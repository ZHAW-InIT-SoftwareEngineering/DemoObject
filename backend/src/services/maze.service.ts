import type { Maze, MazeId } from "../domain/maze";
import { mazes } from "../domain/maze";

export function getMazeById(mazeId: MazeId): Maze {
  if (!mazes[mazeId]) {
    console.error("Maze not found! default to mazeId = 0");
    return mazes[0];
  }

  return mazes[mazeId];
};
