import { useMemo } from "react";
import type {
  MazesMazeIdGet200Response,
  MazesMazeIdPathsDslPostRequestPathInner,
} from "@/api";

export function useShortestPathEdgeKeys(
  maze: MazesMazeIdGet200Response | null | undefined,
  path: MazesMazeIdPathsDslPostRequestPathInner[] | null | undefined,
) {
  return useMemo(() => {
    if (!maze || !path || path.length === 0) return [];

    const nodeIdByCoord = new Map<string, number>();
    for (const node of maze.nodes ?? []) {
      nodeIdByCoord.set(`${node.x},${node.y}`, node.mazeNodeId);
    }

    const ids: number[] = [];
    for (const point of path) {
      const id = nodeIdByCoord.get(`${point.x},${point.y}`);
      if (id !== undefined) ids.push(id);
    }

    if (ids.length < 2) return [];

    const keys: string[] = [];
    for (let i = 0; i < ids.length - 1; i += 1) {
      const from = ids[i];
      const to = ids[i + 1];
      keys.push(`${from}-${to}`);
      keys.push(`${to}-${from}`);
    }

    return keys;
  }, [maze, path]);
}
