import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { ActionPanel } from "@/components/app/ActionPanel";
import { useDemoFlow } from "@/components/app/DemoFlowProvider";
import { DslStrip } from "@/components/app/DslStrip";
import { ResetPathConfirmationOverlay } from "@/components/app/ResetPathConfirmationOverlay";
import { AnimationView } from "@/components/app/animation/AnimationView";
import { MazePanel } from "@/components/app/maze/MazePanel";
import { buildAnimationSceneData } from "@/lib/animation";

export function MazeEditorPage() {
  const navigate = useNavigate();
  const {
    animationState,
    canShowAnimationButton,
    closeAnimationView,
    dsl,
    error,
    isPathSubmitted,
    maze,
    nodePath,
    open3DPreview,
    pathKey,
    requestShortestPath,
    resetPath,
    selectNode,
    shortestPath,
    shortestPathNodePath,
    showAnimationPathSelection,
    submitError,
    submitPath,
    submitting,
    undoNodeSelection,
    userPathLength,
    apiRequest,
    hasShortestPathForCurrentSubmission,
    lastSubmittedKey,
  } = useDemoFlow();
  const [resetPathConfirmationOpen, setResetPathConfirmationOpen] =
    useState(false);

  const [resetDSLInformation, setDSLInfromationOpen] = 
    useState(false);

  useEffect(() => {
    if (animationState.status !== "playing") return;
    void navigate({ to: "/maze/animation", replace: true });
  }, [animationState.status, navigate]);

  const previewProgress = Math.max(animationState.nodePath.length - 1, 0);
  const previewSceneData = useMemo(
    () =>
      buildAnimationSceneData(
        maze,
        animationState.nodePath,
        previewProgress,
        nodePath,
        shortestPathNodePath,
      ),
    [
      maze,
      animationState.nodePath,
      nodePath,
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
  };

  const handleResetDSLInfo = () => {
    setDSLInfromationOpen(true);
  };

  const handleConfirmDSLInfo = () => {
    setDSLInfromationOpen(false);
  };

  if (!maze) {
    return null;
  }

  if (animationState.status === "preview") {
    return (
      <AnimationView
        sceneData={previewSceneData}
        progress={previewProgress}
        total={previewProgress}
        label="3D-Labyrinthvorschau"
        showPlaybackCamera={false}
        onClose={closeAnimationView}
      />
    );
  }

  return (
    <div className="min-h-screen p-6 flex flex-col items-center justify-start md:justify-center">
      <ResetPathConfirmationOverlay
        open={resetPathConfirmationOpen}
        onOpenChange={setResetPathConfirmationOpen}
        onConfirmReset={handleConfirmResetPath}
      />
      <div className="w-full max-w-[520px] space-y-4">
        {error && <div className="text-red-600">{error}</div>}
        {submitError && <div className="text-red-600">{submitError}</div>}
        <DslStrip dsl={dsl} />
        <MazePanel
          maze={maze}
          onNodeClick={selectNode}
          onUndo={undoNodeSelection}
          onShowAnimation={showAnimationPathSelection}
          onOpen3DPreview={open3DPreview}
          isPathSubmitted={isPathSubmitted}
          canShowAnimationButton={canShowAnimationButton}
          nodePath={nodePath}
          secondaryHighlightedNodePath={shortestPathNodePath}
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
            onSubmit: () => void submitPath(),
            onShortestPath: () => void requestShortestPath(),
          }}
        />
      </div>
    </div>
  );
}
