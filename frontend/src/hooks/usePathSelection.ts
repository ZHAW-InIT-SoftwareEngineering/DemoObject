import { useCallback, useEffect, useMemo, useState } from "react";
import type {
  MazesMazeIdGet200Response,
  MazesMazeIdGet200ResponseNodesInner,
  MazesMazeIdPathsDslPostRequest,
  SessionsSessionIdPathsGet200Response,
} from "@/api";
import {
  readPersistedDemoDraftPath,
  writePersistedDemoDraftPath,
} from "@/lib/demoDraftPathStorage";
import { sessionsApi } from "../lib/api";
import { nodePathToCoordPath, type NodePath } from "@/lib/path/transforms";

type PathSelection = {
  nodePath: NodePath;
  pathKey: string;
  apiRequest: MazesMazeIdPathsDslPostRequest | null;
  selectNode: (node: MazesMazeIdGet200ResponseNodesInner) => boolean;
  resetPath: () => void;
  getDSL: () => Promise<SessionsSessionIdPathsGet200Response | null>;
  undoNodeSelection: () => void;
  dsl: string[] | null;
  submitError: string | null;
  submitting: boolean;
  lastSubmittedKey: string | null;
};

export function usePathSelection(
  maze: MazesMazeIdGet200Response | null,
  sessionId?: string | null,
): PathSelection {
  const [nodePath, setNodePath] = useState<NodePath>([]);
  const [dsl, setDsl] = useState<string[] | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [lastSubmittedKey, setLastSubmittedKey] = useState<string | null>(null);
  const [hydratedPathScopeKey, setHydratedPathScopeKey] = useState<
    string | null
  >(null);

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
    setLastSubmittedKey(null);
  }, [sessionId]);

  useEffect(() => {
    if (!maze || !sessionId || !pathStorageScopeKey) return;
    if (hydratedPathScopeKey !== pathStorageScopeKey) return;

    writePersistedDemoDraftPath(sessionId, maze.mazeId, nodePath);
  }, [hydratedPathScopeKey, maze, nodePath, pathStorageScopeKey, sessionId]);

  const resetPath = useCallback(() => {
    if (maze?.startNodeId !== undefined && maze?.startNodeId !== null) {
      setNodePath([maze.startNodeId]);
    } else {
      setNodePath([]);
    }
    setDsl(null);
    setSubmitError(null);
    setLastSubmittedKey(null);
  }, [maze?.startNodeId]);

  const pathKey = useMemo(() => nodePath.join(","), [nodePath]);

  const apiRequest = useMemo(() => {
    if (!maze || nodePath.length === 0) return null;
    const path = nodePathToCoordPath(nodePath, nodeById);
    if (path.length !== nodePath.length) return null;
    return { path };
  }, [maze, nodeById, nodePath]);

  useEffect(() => {
    setDsl(null);
    setSubmitError(null);
  }, [pathKey, sessionId]);

  const undoNodeSelection = useCallback(() => {
    setNodePath((prev) => (prev.length > 1 ? prev.slice(0, -1) : prev));
  }, []);

  const getDSL = useCallback(async () => {
    if (!sessionId || !apiRequest) return null;
    setSubmitting(true);
    setSubmitError(null);
    try {
      const response = await sessionsApi.sessionsSessionIdPathsPut({
        sessionId,
        mazesMazeIdPathsDslPostRequest: apiRequest,
      });
      setDsl(response.dsl ?? null);
      setLastSubmittedKey(pathKey);
      return response;
    } catch {
      setSubmitError("Senden des Pfads fehlgeschlagen.");
      return null;
    } finally {
      setSubmitting(false);
    }
  }, [apiRequest, pathKey, sessionId]);

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

      // Re-clicking the current endpoint deselects it and restores the previous endpoint.
      if (node.mazeNodeId === currentNodeId) {
        if (nodePath.length > 1) {
          setNodePath((prev) => prev.slice(0, -1));
          return true;
        }
        return false;
      }

      // Dragging back to the previous node should undo the latest step.
      if (previousNodeId !== undefined && node.mazeNodeId === previousNodeId) {
        setNodePath((prev) => prev.slice(0, -1));
        return true;
      }

      const canAppend = Boolean(
        adjacency.get(currentNodeId)?.has(node.mazeNodeId),
      );

      if (canAppend) {
        setNodePath((prev) => [...prev, node.mazeNodeId]);
      }

      return canAppend;
    },
    [adjacency, maze, nodePath],
  );

  return {
    nodePath,
    pathKey,
    apiRequest,
    selectNode,
    resetPath,
    getDSL,
    undoNodeSelection,
    dsl,
    submitError,
    submitting,
    lastSubmittedKey,
  };
}

function isRestorableNodePath(
  candidateNodePath: NodePath,
  startNodeId: number,
  nodeById: ReadonlyMap<number, MazesMazeIdGet200ResponseNodesInner>,
  adjacency: ReadonlyMap<number, ReadonlySet<number>>,
) {
  if (candidateNodePath.length === 0) return false;
  if (candidateNodePath[0] !== startNodeId) return false;

  for (let i = 0; i < candidateNodePath.length; i += 1) {
    const nodeId = candidateNodePath[i];
    if (!nodeById.has(nodeId)) return false;

    if (i === 0) continue;

    const previousNodeId = candidateNodePath[i - 1];
    if (!adjacency.get(previousNodeId)?.has(nodeId)) {
      return false;
    }
  }

  return true;
}
