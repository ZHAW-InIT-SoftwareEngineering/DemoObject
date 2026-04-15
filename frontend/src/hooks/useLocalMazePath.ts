import { useCallback, useEffect, useMemo, useState } from "react";
import type {
  MazesMazeIdGet200Response,
  MazesMazeIdGet200ResponseNodesInner,
} from "@/api";
import type { NodePath } from "@/lib/path/transforms";

export function useLocalMazePath(maze: MazesMazeIdGet200Response | null) {
  const [nodePath, setNodePath] = useState<NodePath>([]);

  const adjacency = useMemo(() => {
    const edges = maze?.edges ?? [];
    const map = new Map<number, Set<number>>();

    for (const edge of edges) {
      const fromSet = map.get(edge.from) ?? new Set<number>();
      fromSet.add(edge.to);
      map.set(edge.from, fromSet);

      const toSet = map.get(edge.to) ?? new Set<number>();
      toSet.add(edge.from);
      map.set(edge.to, toSet);
    }

    return map;
  }, [maze?.edges]);

  useEffect(() => {
    const startNodeId = maze?.startNodeId;
    if (startNodeId === undefined || startNodeId === null) {
      setNodePath([]);
      return;
    }

    setNodePath([startNodeId]);
  }, [maze?.startNodeId]);

  const resetPath = useCallback(() => {
    if (maze?.startNodeId !== undefined && maze?.startNodeId !== null) {
      setNodePath([maze.startNodeId]);
      return;
    }

    setNodePath([]);
  }, [maze?.startNodeId]);

  const pathKey = useMemo(() => nodePath.join(","), [nodePath]);

  const undoNodeSelection = useCallback(() => {
    setNodePath((previousNodePath) =>
      previousNodePath.length > 1
        ? previousNodePath.slice(0, -1)
        : previousNodePath,
    );
  }, []);

  const selectNode = useCallback(
    (node: MazesMazeIdGet200ResponseNodesInner) => {
      if (!maze) return false;

      if (nodePath.length === 0) {
        const canStart = node.mazeNodeId === maze.startNodeId;
        if (canStart) {
          setNodePath([node.mazeNodeId]);
        }
        return canStart;
      }

      const currentNodeId = nodePath[nodePath.length - 1];
      const previousNodeId =
        nodePath.length > 1 ? nodePath[nodePath.length - 2] : undefined;

      if (node.mazeNodeId === currentNodeId) {
        if (nodePath.length > 1) {
          setNodePath((previousNodePath) => previousNodePath.slice(0, -1));
          return true;
        }
        return false;
      }

      if (previousNodeId !== undefined && node.mazeNodeId === previousNodeId) {
        setNodePath((previousNodePath) => previousNodePath.slice(0, -1));
        return true;
      }

      const canAppend = Boolean(adjacency.get(currentNodeId)?.has(node.mazeNodeId));

      if (canAppend) {
        setNodePath((previousNodePath) => [...previousNodePath, node.mazeNodeId]);
      }

      return canAppend;
    },
    [adjacency, maze, nodePath],
  );

  const userPathLength = Math.max(0, nodePath.length - 1);

  return useMemo(
    () => ({
      nodePath,
      pathKey,
      selectNode,
      resetPath,
      undoNodeSelection,
      userPathLength,
    }),
    [nodePath, pathKey, resetPath, selectNode, undoNodeSelection, userPathLength],
  );
}
