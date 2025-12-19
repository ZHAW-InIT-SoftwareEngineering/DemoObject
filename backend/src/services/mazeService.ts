import { mazes, MazeDefinition } from "../data/mazes";

export function getMazeById(mazeId: string): MazeDefinition | undefined {
  return mazes[mazeId];
}
