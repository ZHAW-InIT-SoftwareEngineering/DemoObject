import { useCallback, useEffect, useMemo, useState } from "react";
import type {
  MazesMazeIdGet200Response,
  MazesMazeIdGet200ResponseNodesInner,
  MazesMazeIdPathsDslPostRequest,
} from "@/api";
import {
  readPersistedDemoDraftPath,
  writePersistedDemoDraftPath,
} from "@/lib/demoDraftPathStorage";
import { nodePathToCoordPath, type NodePath } from "@/lib/path/transforms";

export function useMazePathDraft(
  maze: MazesMazeIdGet200Response | null,
  sessionId?: string | null,
) {
  const [nodePath, setNodePath] = useState<NodePath>([]);
  const [hydratedPathScopeKey, setHydratedPathScopeKey] = useState<
    string | null
  >(null);

  const nodeById = useMemo(() => {
    const nodes = maze?.nodes ?? [];
    return new Map(nodes.map((node) => [node.mazeNodeId, node]));
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

  const pathStorageScopeKey =
    maze && sessionId ? `${maze.mazeId}:${sessionId}` : null;

  useEffect(() => {
    setHydratedPathScopeKey(null);

    const startNodeId = maze?.startNodeId;
    if (startNodeId === undefined || startNodeId === null) {
      setNodePath([]);
      return;
    }

    const fallbackNodePath: NodePath = [startNodeId];
    if (!maze || !sessionId || !pathStorageScopeKey) {
      setNodePath(fallbackNodePath);
      return;
    }

    const persistedDraftPath = readPersistedDemoDraftPath();
    if (
      !persistedDraftPath ||
      persistedDraftPath.mazeId !== maze.mazeId ||
      persistedDraftPath.sessionId !== sessionId ||
      !isRestorableNodePath(
        persistedDraftPath.nodePath,
        startNodeId,
        nodeById,
        adjacency,
      )
    ) {
      setNodePath(fallbackNodePath);
      setHydratedPathScopeKey(pathStorageScopeKey);
      return;
    }

    setNodePath(persistedDraftPath.nodePath);
    setHydratedPathScopeKey(pathStorageScopeKey);
  }, [adjacency, maze, nodeById, pathStorageScopeKey, sessionId]);

  useEffect(() => {
    if (!maze || !sessionId || !pathStorageScopeKey) return;
    if (hydratedPathScopeKey !== pathStorageScopeKey) return;

    const persistedDraftPath = readPersistedDemoDraftPath();
    if (
      persistedDraftPath?.mazeId === maze.mazeId &&
      persistedDraftPath.sessionId === sessionId &&
      persistedDraftPath.nodePath.join(",") === nodePath.join(",")
    ) {
      return;
    }

    writePersistedDemoDraftPath(sessionId, maze.mazeId, nodePath);
  }, [hydratedPathScopeKey, maze, nodePath, pathStorageScopeKey, sessionId]);

  const resetPath = useCallback(() => {
    if (maze?.startNodeId !== undefined && maze?.startNodeId !== null) {
      setNodePath([maze.startNodeId]);
      return;
    }

    setNodePath([]);
  }, [maze?.startNodeId]);

  const pathKey = useMemo(() => nodePath.join(","), [nodePath]);

  const apiRequest = useMemo<MazesMazeIdPathsDslPostRequest | null>(() => {
    if (!maze || nodePath.length === 0) return null;

    const path = nodePathToCoordPath(nodePath, nodeById);
    if (path.length !== nodePath.length) return null;

    return { path };
  }, [maze, nodeById, nodePath]);

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

      const canAppend = Boolean(
        adjacency.get(currentNodeId)?.has(node.mazeNodeId),
      );

      if (canAppend) {
        setNodePath((previousNodePath) => [
          ...previousNodePath,
          node.mazeNodeId,
        ]);
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
      apiRequest,
      selectNode,
      resetPath,
      undoNodeSelection,
      userPathLength,
    }),
    [
      apiRequest,
      nodePath,
      pathKey,
      resetPath,
      selectNode,
      undoNodeSelection,
      userPathLength,
    ],
  );
}

function isRestorableNodePath(
  candidateNodePath: NodePath,
  startNodeId: number,
  nodeById: ReadonlyMap<number, MazesMazeIdGet200ResponseNodesInner>,
  adjacency: ReadonlyMap<number, ReadonlySet<number>>,
) {
  if (candidateNodePath.length === 0) return false;
  if (candidateNodePath[0] !== startNodeId) return false;

  for (let index = 0; index < candidateNodePath.length; index += 1) {
    const nodeId = candidateNodePath[index];
    if (!nodeById.has(nodeId)) return false;

    if (index === 0) continue;

    const previousNodeId = candidateNodePath[index - 1];
    if (!adjacency.get(previousNodeId)?.has(nodeId)) {
      return false;
    }
  }

  return true;
}
