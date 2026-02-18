import { useMemo, useState } from "react";
import {
  useAnimationScenePlayback,
  useAnimationPathSelection,
  useDemo,
  usePathSelection,
  usePerfectPathCelebration,
  useShortestPath,
  useShortestPathNodePath,
  usePathAnimation,
} from "./hooks/";
import { buildAnimationSceneData } from "@/lib/animation";
import { Toaster } from "@/components/ui";
import { ActionPanel } from "@/components/app/ActionPanel";
import { DslStrip } from "@/components/app/DslStrip";
import { MazePanel } from "@/components/app/maze/MazePanel";
import { StartScreen } from "@/components/app/StartScreen";
import { StartLoadingScreen } from "@/components/app/StartLoadingScreen";
import { AnimationPathSelectionOverlay } from "@/components/app/animation/AnimationPathSelectionOverlay";
import { CelebrationOverlay } from "@/components/app/animation/CelebrationOverlay";
import { AnimationView } from "@/components/app/animation/AnimationView";
import { toast } from "sonner";

export default function App() {
  const MAZEID = 0;

  const { loading, session, maze, error, startAdventure } = useDemo();

  const {
    nodePath,
    apiRequest,
    pathKey,
    selectNode,
    undoNodeSelection,
    resetPath,
    getDSL,
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
  const shortestPathNodePath = useShortestPathNodePath(
    maze,
    shortestPath?.path,
  );
  const {
    animationState,
    startAnimation,
    startPreviewAnimation,
    onCompleteAnimation,
    closeAnimationView,
  } = usePathAnimation();
  const playbackNodePath =
    animationState.status === "playing" ? animationState.nodePath : [];
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
  const { progress, total, sceneData } = useAnimationScenePlayback({
    maze,
    nodePath: playbackNodePath,
    onComplete: onCompleteAnimation,
    stepMs: 260,
    settleMs: 5200,
  });

  const userPathLength = Math.max(0, nodePath.length - 1);
  const [lastShortestPathSubmissionKey, setLastShortestPathSubmissionKey] =
    useState<string | null>(null);
  
  const handleStartAdventure = () => {
    startAdventure(MAZEID);
  };

  const handleResetPath = () => {
    resetPath();
  };

  const handleSubmitPath = async () => {
    const response = await getDSL();
    if (response) {
      setLastShortestPathSubmissionKey(null);
      toast.success("Path submitted.");
    } else {
      toast.error("Failed to submit path.");
    }
  };

  const handleShortestPath = async () => {
    try {
      const shortestPathRes = await getShortestPath(MAZEID);
      if (shortestPathRes) {
        if (lastSubmittedKey) {
          setLastShortestPathSubmissionKey(lastSubmittedKey);
        }
        toast.success("Shortest path loaded.");
        maybeCelebrateForPathLength(userPathLength, shortestPathRes.length);
      } else {
        toast.error("Failed to compute shortest path.");
      }
    } catch (err: any) {
      console.error("Failed to find a shortest path.");
      toast.error("Failed to find a shortest path.");
    }
  };

  const handleUndoNodeSelection = () => {
    undoNodeSelection();
  };

  const handleCloseAnimationView = () => {
    closeAnimationView();
  };

  const isPathSubmitted =
    Boolean(lastSubmittedKey) && pathKey === lastSubmittedKey;
  const hasShortestPathDisplayed = shortestPathNodePath.length > 1;
  const hasShortestPathForCurrentSubmission =
    hasShortestPathDisplayed &&
    Boolean(lastSubmittedKey) &&
    lastSubmittedKey === lastShortestPathSubmissionKey;
  const canShowAnimationButton =
    isPathSubmitted &&
    hasShortestPathForCurrentSubmission &&
    hasAnimatablePath;
  const isPreviewView = animationState.status === "preview";
  const previewProgress = Math.max(animationState.nodePath.length - 1, 0);
  const previewSceneData = useMemo(
    () =>
      buildAnimationSceneData(maze, animationState.nodePath, previewProgress),
    [maze, animationState.nodePath, previewProgress],
  );
  const viewProgress = isPreviewView ? previewProgress : progress;
  const viewTotal = isPreviewView ? previewProgress : total;
  const viewSceneData = isPreviewView ? previewSceneData : sceneData;

  const isStartScreen = !session;
  const isAnimationView =
    animationState.status === "playing" || isPreviewView;

  if (isStartScreen && loading) {
    return (
      <>
        <Toaster />
        <StartLoadingScreen />
      </>
    );
  }

  if (isStartScreen) {
    return (
      <div className="min-h-screen p-6 flex flex-col items-center justify-center">
        <Toaster />
        <div className="w-full max-w-[520px] space-y-4">
          {error && <div className="text-red-600">{error}</div>}
          <StartScreen loading={loading} onStart={handleStartAdventure} />
        </div>
      </div>
    );
  }

  return (
    <div
      className={
        isAnimationView
          ? "min-h-[100dvh] w-full bg-[#11151d]"
          : "min-h-screen p-6 flex flex-col items-center justify-start md:justify-center"
      }
    >
      <Toaster />
      <CelebrationOverlay
        open={showCelebrationOverlay}
        onClose={dismissCelebrationOverlay}
      />
      <AnimationPathSelectionOverlay
        open={animationPathSelectionOpen}
        onOpenChange={setAnimationPathSelectionOpen}
        onSelectPath={onSelectAnimationPath}
        canUseUserPath={canUseUserPath}
        canUseShortestPath={canUseShortestPath}
        userPathLength={userPathLength}
        shortestPathLength={shortestPath?.length}
      />
      {isAnimationView ? (
        <AnimationView
          sceneData={viewSceneData}
          progress={viewProgress}
          total={viewTotal}
          label={isPreviewView ? "3D maze preview" : undefined}
          showPlaybackCamera={!isPreviewView}
          onClose={isPreviewView ? handleCloseAnimationView : undefined}
        />
      ) : (
        <div className="w-full max-w-[520px] space-y-4">
          {error && <div className="text-red-600">{error}</div>}
          {submitError && <div className="text-red-600">{submitError}</div>}
          <DslStrip dsl={dsl} />
          {maze && (
            <MazePanel
              maze={maze}
              onNodeClick={selectNode}
              onUndo={handleUndoNodeSelection}
              onShowAnimation={onShowAnimation}
              onOpen3DPreview={onOpen3DPreview}
              isPathSubmitted={isPathSubmitted}
              canShowAnimationButton={canShowAnimationButton}
              nodePath={nodePath}
              secondaryHighlightedNodePath={shortestPathNodePath}
              userPathLength={userPathLength}
              shortestPathLength={shortestPath?.length}
            />
          )}
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
              onSubmit: handleSubmitPath,
              onShortestPath: handleShortestPath,
            }}
          />
        </div>
      )}
    </div>
  );
}
