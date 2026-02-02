import { mazes, MazeDefinition } from "../data/mazes";

export function getMazeById(mazeId: number): MazeDefinition | undefined {
  return mazes[mazeId];
}
