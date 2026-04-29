import {
  MazesMazeIdShortestPathGetAlgorithmEnum,
  type MazesMazeIdShortestPathGet200Response,
} from "../api";
import { mazeApi } from "../lib/api";

export const ShortestPathAlgorithm = {
  Bfs: MazesMazeIdShortestPathGetAlgorithmEnum.Bfs,
  Dijkstra: MazesMazeIdShortestPathGetAlgorithmEnum.Dijkstra,
} as const;

export type ShortestPathAlgorithm =
  typeof ShortestPathAlgorithm[keyof typeof ShortestPathAlgorithm];

export async function getMazeById(mazeId: number) {
    const mazeRes = await mazeApi.mazesMazeIdGet({ mazeId: mazeId });
    return mazeRes
}

export async function getShortestPath(
  mazeId: number,
  algorithm: ShortestPathAlgorithm = ShortestPathAlgorithm.Bfs,
): Promise<MazesMazeIdShortestPathGet200Response> {
    const shortestPath = await mazeApi.mazesMazeIdShortestPathGet({
      mazeId: mazeId,
      algorithm,
    });
    return shortestPath
}
