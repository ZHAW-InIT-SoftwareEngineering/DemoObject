import { useMemo } from "react";
import type {
  MazesMazeIdGet200Response,
  MazesMazeIdPathsDslPostRequestPathInner,
} from "@/api";
import { coordPathToNodePath, type NodePath } from "@/lib/path/transforms";

export function useShortestPathNodePath(
  maze: MazesMazeIdGet200Response | null | undefined,
  path: MazesMazeIdPathsDslPostRequestPathInner[] | null | undefined,
): NodePath {
  return useMemo(() => {
    if (!maze || !path || path.length === 0) return [];

    const nodeIdByCoord = new Map<string, number>();
    for (const node of maze.nodes ?? []) {
      nodeIdByCoord.set(`${node.x},${node.y}`, node.mazeNodeId);
    }

    return coordPathToNodePath(path, nodeIdByCoord);
  }, [maze, path]);
}
