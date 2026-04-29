import { Path, PathAlgorithm, pathToDsl, findPathBFS, findPathDijkstra } from "../domain";
import { getSession, updateSession } from "../repositories";
import { getMazeById } from "./maze.service";

export async function storePathAndDSLForSession(
  sessionId: string,
  path: Path,
  elapsedMs: number,
) {
    const existing = await getSession(sessionId);
    if (!existing) return null;

    const dsl = pathToDsl(path);
    return updateSession(sessionId, { path, dsl, elapsedMs });
};

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
