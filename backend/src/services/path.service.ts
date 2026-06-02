import { Path, PathAlgorithm, pathToDsl, findPathBFS, findPathDijkstra } from "../domain";
import { getMazeById } from "./maze.service";

export function computeDSLFromPath(path: Path) {
    return pathToDsl(path);
};

export function computeShortestPath(
  mazeId: number,
  algorithm: PathAlgorithm = "bfs",
) {
    const maze = getMazeById(mazeId);
    if (!maze) return undefined;
    return algorithm === "dijkstra"
      ? findPathDijkstra(maze)
      : findPathBFS(maze);
}; 
