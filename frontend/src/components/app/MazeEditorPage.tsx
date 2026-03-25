import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import { ActionPanel } from "@/components/app/ActionPanel";
import { useMazeFlow } from "@/components/app/MazeFlowProvider";
import { DslStrip } from "@/components/app/DslStrip";
import { ResetPathConfirmationOverlay } from "@/components/app/ResetPathConfirmationOverlay";
import {
  AnimationPathSelectionOverlay,
  type AnimationPathChoice,
} from "@/components/app/animation/AnimationPathSelectionOverlay";
import { AnimationView } from "@/components/app/animation/AnimationView";
import { CelebrationOverlay } from "@/components/app/animation/CelebrationOverlay";
import { MazePanel } from "@/components/app/maze/MazePanel";
import { buildAnimationSceneData } from "@/lib/animation";
import {
  useDemoSession,
  useMazePathDraft,
  usePathSubmission,
  useShortestPathFlow,
} from "@/hooks";
import type { NodePath } from "@/lib/path/transforms";


export function MazeEditorPage() {
  const navigate = useNavigate();
  const { error, maze, session } = useDemoSession();
  const { animationState, startAnimation } = useMazeFlow();
  const mazePathDraft = useMazePathDraft(maze, session?.sessionId);
  const pathSubmission = usePathSubmission({
    apiRequest: mazePathDraft.apiRequest,
    mazeId: maze?.mazeId,
    pathKey: mazePathDraft.pathKey,
    sessionId: session?.sessionId,
  });
  const shortestPathFlow = useShortestPathFlow({
    maze,
    pathKey: mazePathDraft.pathKey,
    sessionId: session?.sessionId,
    lastSubmittedKey: pathSubmission.lastSubmittedKey,
    userPathLength: mazePathDraft.userPathLength,
  });
  const {
    nodePath,
    pathKey,
    selectNode,
    resetPath,
    undoNodeSelection,
    userPathLength,
    apiRequest,
  } = mazePathDraft;
  const {
    dsl,
    submitError,
    submitting,
    lastSubmittedKey,
    isPathSubmitted,
    submitPath,
    resetSubmission,
  } = pathSubmission;
  const {
    shortestPath,
    shortestPathNodePath,
    displayedShortestPathNodePath,
    explorationDiscoveredEdgeKeys,
    explorationSeenEdgeKeys,
    currentExplorationEdgeKey,
    currentExplorationEdgeDiscovered,
    requestShortestPath,
    showCelebrationOverlay,
    dismissCelebrationOverlay,
    hasShortestPathForCurrentSubmission,
    isExplorationAnimating,
  } = shortestPathFlow;
  const [resetPathConfirmationOpen, setResetPathConfirmationOpen] =
    useState(false);
  const [animationPathSelectionOpen, setAnimationPathSelectionOpen] =
    useState(false);
  const [previewNodePath, setPreviewNodePath] = useState<NodePath>([]);
  const [revealedDslPathKeys, setRevealedDslPathKeys] = useState<Set<string>>(
    () => new Set(),
  );

  const currentDslPathKey = `${session?.sessionId ?? "no-session"}:${
    maze?.mazeId ?? "no-maze"
  }:${pathKey}`;

  useEffect(() => {
    setRevealedDslPathKeys(new Set());
  }, [maze?.mazeId, session?.sessionId]);

  useEffect(() => {
    if (animationState.status !== "playing") return;
    void navigate({ to: "/maze/animation", replace: true });
  }, [animationState.status, navigate]);

  const canUseUserPath = nodePath.length > 1;
  const canUseShortestPath = shortestPathNodePath.length > 1;
  const hasAnimatablePath = canUseUserPath || canUseShortestPath;
  const canShowAnimationButton =
    isPathSubmitted && hasShortestPathForCurrentSubmission && hasAnimatablePath;
  const shouldShowDsl = revealedDslPathKeys.has(currentDslPathKey);

  const previewProgress = Math.max(previewNodePath.length - 1, 0);
  const previewSceneData = useMemo(
    () =>
      buildAnimationSceneData(
        maze,
        previewNodePath,
        previewProgress,
        nodePath,
        shortestPathNodePath,
      ),
    [
      maze,
      nodePath,
      previewNodePath,
      previewProgress,
      shortestPathNodePath,
    ],
  );

  const handleResetPath = () => {
    setResetPathConfirmationOpen(true);
  };

  const handleConfirmResetPath = () => {
    setResetPathConfirmationOpen(false);
    resetPath();
    resetSubmission();
  };

  const handleSubmitPath = async () => {
    if (!maze || nodePath[nodePath.length - 1] !== maze.endNodeId) {
      toast.error("Der Pfad muss am Ziel enden.");
      return;
    }

    const response = await submitPath();
    if (response) {
      setRevealedDslPathKeys((previousPathKeys) => {
        const nextPathKeys = new Set(previousPathKeys);
        nextPathKeys.add(currentDslPathKey);
        return nextPathKeys;
      });
      toast.success("Pfad gesendet.");
      return;
    }

    toast.error("Senden des Pfads fehlgeschlagen.");
  };

  const handleShortestPath = async () => {
    const result = await requestShortestPath();
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
  };

  const handleShowAnimationPathSelection = () => {
    if (!hasAnimatablePath) {
      toast.error("Kein Pfad zum Animieren verfügbar.");
      return;
    }

    setAnimationPathSelectionOpen(true);
  };

  const handleSelectAnimationPath = (choice: AnimationPathChoice) => {
    const animationNodePath =
      choice === "shortest" ? shortestPathNodePath : nodePath;

    if (
      !startAnimation({
        nodePath: animationNodePath,
        userNodePath: nodePath,
        shortestNodePath: shortestPathNodePath,
      })
    ) {
      toast.error("Kein Pfad zum Animieren verfügbar.");
      return;
    }

    setAnimationPathSelectionOpen(false);
    toast("Pfadanimation läuft.");
  };

  const handleOpen3DPreview = () => {
    const preferredNodePath = canUseShortestPath ? shortestPathNodePath : nodePath;
    if (preferredNodePath.length < 2) {
      toast.error("Kein Pfad zum Animieren verfügbar.");
      return;
    }

    setPreviewNodePath([...preferredNodePath]);
  };

  const handleClosePreview = () => {
    setPreviewNodePath([]);
  };

  if (!maze) {
    return null;
  }

  if (previewNodePath.length > 1) {
    return (
      <AnimationView
        sceneData={previewSceneData}
        progress={previewProgress}
        total={previewProgress}
        label="3D-Labyrinthvorschau"
        showPlaybackCamera={false}
        onClose={handleClosePreview}
      />
    );
  }

  return (
    <div className="min-h-screen p-6 flex flex-col items-center justify-start md:justify-center">
      <CelebrationOverlay
        open={showCelebrationOverlay}
        onClose={dismissCelebrationOverlay}
      />
      <AnimationPathSelectionOverlay
        open={animationPathSelectionOpen}
        onOpenChange={setAnimationPathSelectionOpen}
        onSelectPath={handleSelectAnimationPath}
        canUseUserPath={canUseUserPath}
        canUseShortestPath={canUseShortestPath}
        userPathLength={userPathLength}
        shortestPathLength={shortestPath?.length}
      />
      <ResetPathConfirmationOverlay
        open={resetPathConfirmationOpen}
        onOpenChange={setResetPathConfirmationOpen}
        onConfirmReset={handleConfirmResetPath}
      />
      <div className="w-full max-w-[520px] space-y-4">
        {error && <div className="text-red-600">{error}</div>}
        {submitError && <div className="text-red-600">{submitError}</div>}
        <DslStrip dsl={shouldShowDsl ? dsl : null} />
        <MazePanel
          maze={maze}
          onNodeClick={selectNode}
          onUndo={undoNodeSelection}
          onShowAnimation={handleShowAnimationPathSelection}
          onOpen3DPreview={handleOpen3DPreview}
          isPathSubmitted={isPathSubmitted}
          canShowAnimationButton={canShowAnimationButton}
          nodePath={nodePath}
          secondaryHighlightedNodePath={displayedShortestPathNodePath}
          explorationDiscoveredEdgeKeys={explorationDiscoveredEdgeKeys}
          explorationSeenEdgeKeys={explorationSeenEdgeKeys}
          currentExplorationEdgeKey={currentExplorationEdgeKey}
          currentExplorationEdgeDiscovered={currentExplorationEdgeDiscovered}
          showExplorationLegend={isExplorationAnimating}
          userPathLength={userPathLength}
          shortestPathLength={shortestPath?.length}
        />
        <ActionPanel
          maze={maze}
          pathState={{
            nodePath,
            apiRequest,
            submitting,
            pathKey,
            lastSubmittedKey,
            hasShortestPathForCurrentSubmission,
          }}
          actions={{
            onReset: handleResetPath,
            onSubmit: () => void handleSubmitPath(),
            onShortestPath: () => void handleShortestPath(),
          }}
        />
      </div>
    </div>
  );
}
