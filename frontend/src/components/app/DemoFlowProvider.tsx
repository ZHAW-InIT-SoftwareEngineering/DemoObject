import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { toast } from "sonner";
import {
  useAnimationPathSelection,
  useDemo,
  usePathAnimation,
  usePathSelection,
  usePerfectPathCelebration,
  useShortestPath,
  useShortestPathNodePath,
} from "@/hooks";
import type { NodePath } from "@/lib/path/transforms";
import type { AnimationPathChoice } from "@/components/app/animation/AnimationPathSelectionOverlay";

const DEFAULT_MAZE_ID = 0;
type DemoState = ReturnType<typeof useDemo>;

type DemoFlowContextValue = {
  loading: DemoState["loading"];
  session: DemoState["session"];
  maze: DemoState["maze"];
  error: DemoState["error"];
  hasActiveSession: boolean;
  startAdventure: () => Promise<boolean>;
  nodePath: NodePath;
  pathKey: string;
  apiRequest: ReturnType<typeof usePathSelection>["apiRequest"];
  selectNode: ReturnType<typeof usePathSelection>["selectNode"];
  resetPath: () => void;
  undoNodeSelection: () => void;
  dsl: string[] | null;
  submitError: string | null;
  submitting: boolean;
  lastSubmittedKey: string | null;
  submitPath: () => Promise<void>;
  shortestPath: ReturnType<typeof useShortestPath>["shortestPath"];
  shortestPathNodePath: NodePath;
  requestShortestPath: () => Promise<void>;
  showCelebrationOverlay: boolean;
  dismissCelebrationOverlay: () => void;
  animationPathSelectionOpen: boolean;
  setAnimationPathSelectionOpen: (open: boolean) => void;
  canUseUserPath: boolean;
  canUseShortestPath: boolean;
  hasAnimatablePath: boolean;
  showAnimationPathSelection: () => void;
  selectAnimationPath: (choice: AnimationPathChoice) => void;
  open3DPreview: () => void;
  animationState: ReturnType<typeof usePathAnimation>["animationState"];
  closeAnimationView: () => void;
  completeAnimation: () => void;
  userPathLength: number;
  isPathSubmitted: boolean;
  hasShortestPathForCurrentSubmission: boolean;
  canShowAnimationButton: boolean;
};

const DemoFlowContext = createContext<DemoFlowContextValue | null>(null);

export function DemoFlowProvider({ children }: { children: ReactNode }) {
  const { loading, session, maze, error, startAdventure: beginAdventure } = useDemo();
  const {
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
  } = usePathSelection(maze, session?.sessionId);
  const { shortestPath, getShortestPath } = useShortestPath();
  const {
    showCelebrationOverlay,
    maybeCelebrateForPathLength,
    dismissCelebrationOverlay,
  } = usePerfectPathCelebration({
    shortestPathLength: shortestPath?.length,
  });
  const shortestPathNodePath = useShortestPathNodePath(maze, shortestPath?.path);
  const {
    animationState,
    startAnimation,
    startPreviewAnimation,
    onCompleteAnimation,
    closeAnimationView,
  } = usePathAnimation();
  const [lastShortestPathSubmissionKey, setLastShortestPathSubmissionKey] =
    useState<string | null>(null);

  const hasActiveSession = Boolean(session && maze);
  const userPathLength = Math.max(0, nodePath.length - 1);
  const isPathSubmitted = Boolean(lastSubmittedKey) && pathKey === lastSubmittedKey;
  const hasShortestPathDisplayed = shortestPathNodePath.length > 1;
  const hasShortestPathForCurrentSubmission =
    hasShortestPathDisplayed &&
    Boolean(lastSubmittedKey) &&
    lastSubmittedKey === lastShortestPathSubmissionKey;

  const {
    animationPathSelectionOpen,
    setAnimationPathSelectionOpen,
    canUseUserPath,
    canUseShortestPath,
    hasAnimatablePath,
    onShowAnimation,
    onSelectAnimationPath,
    onOpen3DPreview,
  } = useAnimationPathSelection({
    userNodePath: nodePath,
    shortestNodePath: shortestPathNodePath,
    startAnimation,
    startPreviewAnimation,
  });

  const canShowAnimationButton =
    isPathSubmitted &&
    hasShortestPathForCurrentSubmission &&
    hasAnimatablePath;

  const startAdventure = useCallback(async () => {
    return beginAdventure(DEFAULT_MAZE_ID);
  }, [beginAdventure]);

  const submitPath = useCallback(async () => {
    const response = await getDSL();
    if (response) {
      setLastShortestPathSubmissionKey(null);
      toast.success("Path submitted.");
      return;
    }

    toast.error("Failed to submit path.");
  }, [getDSL]);

  const requestShortestPath = useCallback(async () => {
    try {
      const shortestPathResponse = await getShortestPath(maze?.mazeId ?? DEFAULT_MAZE_ID);
      if (!shortestPathResponse) {
        toast.error("Failed to compute shortest path.");
        return;
      }

      if (lastSubmittedKey) {
        setLastShortestPathSubmissionKey(lastSubmittedKey);
      }
      toast.success("Shortest path loaded.");
      maybeCelebrateForPathLength(userPathLength, shortestPathResponse.length);
    } catch {
      console.error("Failed to find a shortest path.");
      toast.error("Failed to find a shortest path.");
    }
  }, [
    getShortestPath,
    lastSubmittedKey,
    maze?.mazeId,
    maybeCelebrateForPathLength,
    userPathLength,
  ]);

  const value = useMemo<DemoFlowContextValue>(
    () => ({
      loading,
      session,
      maze,
      error,
      hasActiveSession,
      startAdventure,
      nodePath,
      pathKey,
      apiRequest,
      selectNode,
      resetPath,
      undoNodeSelection,
      dsl,
      submitError,
      submitting,
      lastSubmittedKey,
      submitPath,
      shortestPath,
      shortestPathNodePath,
      requestShortestPath,
      showCelebrationOverlay,
      dismissCelebrationOverlay,
      animationPathSelectionOpen,
      setAnimationPathSelectionOpen,
      canUseUserPath,
      canUseShortestPath,
      hasAnimatablePath,
      showAnimationPathSelection: onShowAnimation,
      selectAnimationPath: onSelectAnimationPath,
      open3DPreview: onOpen3DPreview,
      animationState,
      closeAnimationView,
      completeAnimation: onCompleteAnimation,
      userPathLength,
      isPathSubmitted,
      hasShortestPathForCurrentSubmission,
      canShowAnimationButton,
    }),
    [
      apiRequest,
      animationPathSelectionOpen,
      animationState,
      canShowAnimationButton,
      canUseShortestPath,
      canUseUserPath,
      closeAnimationView,
      dismissCelebrationOverlay,
      dsl,
      error,
      hasActiveSession,
      hasAnimatablePath,
      hasShortestPathForCurrentSubmission,
      isPathSubmitted,
      lastSubmittedKey,
      loading,
      maze,
      nodePath,
      onOpen3DPreview,
      onSelectAnimationPath,
      onShowAnimation,
      pathKey,
      requestShortestPath,
      resetPath,
      selectNode,
      session,
      setAnimationPathSelectionOpen,
      shortestPath,
      shortestPathNodePath,
      showCelebrationOverlay,
      startAdventure,
      submitError,
      submitPath,
      submitting,
      onCompleteAnimation,
      undoNodeSelection,
      userPathLength,
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
