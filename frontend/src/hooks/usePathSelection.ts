import { useCallback, useEffect, useMemo, useState } from "react";
import type {
  MazesMazeIdGet200Response,
  MazesMazeIdGet200ResponseNodesInner,
  MazesMazeIdPathsDslPostRequest,
} from "@/api";

type PathPoint = { x: number; y: number };

type PathSelection = {
  selectedNodeIds: number[];
  path: PathPoint[];
  apiRequest: MazesMazeIdPathsDslPostRequest | null;
  highlightedEdgeKeys: string[];
  selectNode: (node: MazesMazeIdGet200ResponseNodesInner) => boolean;
  resetPath: () => void;
};

function edgeKey(from: number, to: number) {
  return `${from}-${to}`;
}

export function usePathSelection(
  maze: MazesMazeIdGet200Response | null,
): PathSelection {
  const [selectedNodeIds, setSelectedNodeIds] = useState<number[]>([]);

  const nodeById = useMemo(() => {
    const nodes = maze?.nodes ?? [];
    return new Map(nodes.map((n) => [n.mazeNodeId, n]));
  }, [maze?.nodes]);

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
    setSelectedNodeIds([]);
  }, [maze?.mazeId]);

  const resetPath = useCallback(() => {
    setSelectedNodeIds([]);
  }, []);

  const selectNode = useCallback(
    (node: MazesMazeIdGet200ResponseNodesInner) => {
      if (!maze) return false;

      if (selectedNodeIds.length === 0) {
        const canStart = node.mazeNodeId === maze.startNodeId;
        if (canStart) {
          setSelectedNodeIds([node.mazeNodeId]);
        }
        return canStart;
      }

      const canAppend =
        Boolean(
          adjacency
            .get(selectedNodeIds[selectedNodeIds.length - 1])
            ?.has(node.mazeNodeId),
        );

      if (canAppend) {
        setSelectedNodeIds((prev) => [...prev, node.mazeNodeId]);
      }

      return canAppend;
    },
    [adjacency, maze, selectedNodeIds],
  );

  const path = useMemo(() => {
    return selectedNodeIds
      .map((id) => nodeById.get(id))
      .filter(Boolean)
      .map((n) => ({ x: n!.x, y: n!.y }));
  }, [nodeById, selectedNodeIds]);

  const apiRequest = useMemo(() => {
    if (!maze || path.length === 0) return null;
    return { path };
  }, [maze, path]);

  const highlightedEdgeKeys = useMemo(() => {
    if (selectedNodeIds.length < 2) return [];
    const keys: string[] = [];
    for (let i = 0; i < selectedNodeIds.length - 1; i += 1) {
      const from = selectedNodeIds[i];
      const to = selectedNodeIds[i + 1];
      keys.push(edgeKey(from, to));
      keys.push(edgeKey(to, from));
    }
    return keys;
  }, [selectedNodeIds]);

  return {
    selectedNodeIds,
    path,
    apiRequest,
    highlightedEdgeKeys,
    selectNode,
    resetPath,
  };
}
