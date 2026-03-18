import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  type ReactNode,
} from "react";
import { toast } from "sonner";
import {
  useDemoSession,
  useMazeAnimationFlow,
  useMazePathDraft,
  usePathSubmission,
  useShortestPathFlow,
} from "@/hooks";
import type { NodePath } from "@/lib/path/transforms";

type DemoFlowContextValue = {
  nodePath: NodePath;
  pathKey: string;
  apiRequest: ReturnType<typeof useMazePathDraft>["apiRequest"];
  selectNode: ReturnType<typeof useMazePathDraft>["selectNode"];
  resetPath: () => void;
  undoNodeSelection: () => void;
  dsl: string[] | null;
  submitError: string | null;
  submitting: boolean;
  lastSubmittedKey: string | null;
  submitPath: () => Promise<void>;
  shortestPath: ReturnType<typeof useShortestPathFlow>["shortestPath"];
  shortestPathNodePath: NodePath;
  displayedShortestPathNodePath: NodePath;
  requestShortestPath: () => Promise<void>;
  showCelebrationOverlay: boolean;
  dismissCelebrationOverlay: () => void;
  animationPathSelectionOpen: boolean;
  setAnimationPathSelectionOpen: (open: boolean) => void;
  canUseUserPath: boolean;
  canUseShortestPath: boolean;
  hasAnimatablePath: boolean;
  showAnimationPathSelection: () => void;
  selectAnimationPath: ReturnType<typeof useMazeAnimationFlow>["selectAnimationPath"];
  open3DPreview: () => void;
  animationState: ReturnType<typeof useMazeAnimationFlow>["animationState"];
  closeAnimationView: () => void;
  completeAnimation: () => void;
  userPathLength: number;
  isPathSubmitted: boolean;
  hasShortestPathForCurrentSubmission: boolean;
  canShowAnimationButton: boolean;
};

const DemoFlowContext = createContext<DemoFlowContextValue | null>(null);

export function DemoFlowProvider({ children }: { children: ReactNode }) {
  const { session, maze } = useDemoSession();
  const mazePathDraft = useMazePathDraft(maze, session?.sessionId);
  const pathSubmission = usePathSubmission({
    apiRequest: mazePathDraft.apiRequest,
    mazeId: maze?.mazeId,
    nodePath: mazePathDraft.nodePath,
    pathKey: mazePathDraft.pathKey,
    sessionId: session?.sessionId,
  });
  const shortestPathFlow = useShortestPathFlow({
    maze,
    lastSubmittedKey: pathSubmission.lastSubmittedKey,
    userPathLength: mazePathDraft.userPathLength,
  });
  const mazeAnimationFlow = useMazeAnimationFlow({
    userNodePath: mazePathDraft.nodePath,
    shortestNodePath: shortestPathFlow.shortestPathNodePath,
    isPathSubmitted: pathSubmission.isPathSubmitted,
    hasShortestPathForCurrentSubmission:
      shortestPathFlow.hasShortestPathForCurrentSubmission,
  });

  const resetPath = useCallback(() => {
    mazePathDraft.resetPath();
    pathSubmission.resetSubmission();
  }, [mazePathDraft, pathSubmission]);

  const submitPath = useCallback(async () => {
    const response = await pathSubmission.submitPath();
    if (response) {
      shortestPathFlow.clearShortestPathSubmissionLink();
      toast.success("Pfad gesendet.");
      return;
    }

    toast.error("Senden des Pfads fehlgeschlagen.");
  }, [pathSubmission, shortestPathFlow]);

  const requestShortestPath = useCallback(async () => {
    const result = await shortestPathFlow.requestShortestPath();
    if (result === "success") {
      toast.success("Kürzester Pfad geladen.");
      return;
    }

    if (result === "missing") {
      toast.error("Der kürzeste Pfad konnte nicht berechnet werden.");
      return;
    }

    console.error("Der kürzeste Pfad konnte nicht gefunden werden.");
    toast.error("Der kürzeste Pfad konnte nicht gefunden werden.");
  }, [shortestPathFlow]);

  const value = useMemo<DemoFlowContextValue>(
    () => ({
      nodePath: mazePathDraft.nodePath,
      pathKey: mazePathDraft.pathKey,
      apiRequest: mazePathDraft.apiRequest,
      selectNode: mazePathDraft.selectNode,
      resetPath,
      undoNodeSelection: mazePathDraft.undoNodeSelection,
      dsl: pathSubmission.dsl,
      submitError: pathSubmission.submitError,
      submitting: pathSubmission.submitting,
      lastSubmittedKey: pathSubmission.lastSubmittedKey,
      submitPath,
      shortestPath: shortestPathFlow.shortestPath,
      shortestPathNodePath: shortestPathFlow.shortestPathNodePath,
      displayedShortestPathNodePath:
        shortestPathFlow.displayedShortestPathNodePath,
      requestShortestPath,
      showCelebrationOverlay: shortestPathFlow.showCelebrationOverlay,
      dismissCelebrationOverlay: shortestPathFlow.dismissCelebrationOverlay,
      animationPathSelectionOpen: mazeAnimationFlow.animationPathSelectionOpen,
      setAnimationPathSelectionOpen:
        mazeAnimationFlow.setAnimationPathSelectionOpen,
      canUseUserPath: mazeAnimationFlow.canUseUserPath,
      canUseShortestPath: mazeAnimationFlow.canUseShortestPath,
      hasAnimatablePath: mazeAnimationFlow.hasAnimatablePath,
      showAnimationPathSelection: mazeAnimationFlow.showAnimationPathSelection,
      selectAnimationPath: mazeAnimationFlow.selectAnimationPath,
      open3DPreview: mazeAnimationFlow.open3DPreview,
      animationState: mazeAnimationFlow.animationState,
      closeAnimationView: mazeAnimationFlow.closeAnimationView,
      completeAnimation: mazeAnimationFlow.completeAnimation,
      userPathLength: mazePathDraft.userPathLength,
      isPathSubmitted: pathSubmission.isPathSubmitted,
      hasShortestPathForCurrentSubmission:
        shortestPathFlow.hasShortestPathForCurrentSubmission,
      canShowAnimationButton: mazeAnimationFlow.canShowAnimationButton,
    }),
    [
      mazeAnimationFlow,
      mazePathDraft,
      pathSubmission,
      requestShortestPath,
      resetPath,
      shortestPathFlow,
      submitPath,
    ],
  );

  return (
    <DemoFlowContext.Provider value={value}>
      {children}
    </DemoFlowContext.Provider>
  );
}

export function useDemoFlow() {
  const context = useContext(DemoFlowContext);

  if (!context) {
    throw new Error("useDemoFlow must be used within a DemoFlowProvider.");
  }

  return context;
}
