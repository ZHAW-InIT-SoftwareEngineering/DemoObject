import type { Maze, MazeId } from "../domain/maze";
import { mazes } from "../domain/mazes";

export function getMazeById(mazeId: MazeId): Maze | null {
  return mazes[mazeId] ?? null;
}
