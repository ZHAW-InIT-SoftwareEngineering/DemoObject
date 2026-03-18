import { useCallback, useMemo } from "react";
import type {
  MazesMazeIdGet200Response,
  MazesMazeIdGet200ResponseNodesInner,
  MazesMazeIdPathsDslPostRequest,
  SessionsSessionIdPathsGet200Response,
} from "@/api";
import type { NodePath } from "@/lib/path/transforms";
import { useMazePathDraft } from "./useMazePathDraft";
import { usePathSubmission } from "./usePathSubmission";

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
  const {
    nodePath,
    pathKey,
    apiRequest,
    selectNode,
    resetPath: resetDraftPath,
    undoNodeSelection,
  } = useMazePathDraft(maze, sessionId);
  const {
    dsl,
    submitError,
    submitting,
    lastSubmittedKey,
    submitPath,
    resetSubmission,
  } = usePathSubmission({
    apiRequest,
    mazeId: maze?.mazeId,
    nodePath,
    pathKey,
    sessionId,
  });

  const resetPath = useCallback(() => {
    resetDraftPath();
    resetSubmission();
  }, [resetDraftPath, resetSubmission]);

  return useMemo(
    () => ({
      nodePath,
      pathKey,
      apiRequest,
      selectNode,
      resetPath,
      getDSL: submitPath as () => Promise<SessionsSessionIdPathsGet200Response | null>,
      undoNodeSelection,
      dsl,
      submitError,
      submitting,
      lastSubmittedKey,
    }),
    [
      apiRequest,
      dsl,
      lastSubmittedKey,
      nodePath,
      pathKey,
      resetPath,
      selectNode,
      submitError,
      submitPath,
      submitting,
      undoNodeSelection,
    ],
  );
}
