import { useMemo } from "react";
import {
  useAnimationScenePlayback,
  useDemo,
  usePathSelection,
  useShortestPath,
  useShortestPathNodePath,
  usePathAnimation,
} from "./hooks/";
import { buildAnimationSceneData } from "@/lib/animation";
import { Toaster } from "@/components/ui";
import { ActionPanel } from "@/components/app/ActionPanel";
import { DslStrip } from "@/components/app/DslStrip";
import { MazePanel } from "@/components/app/maze/MazePanel";
import { PathInfo } from "@/components/app/PathInfo";
import { StartScreen } from "@/components/app/StartScreen";
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
  const { progress, total, sceneData } = useAnimationScenePlayback({
    maze,
    nodePath: playbackNodePath,
    onComplete: onCompleteAnimation,
  });
  const isDevMode = import.meta.env.DEV;

  const userPathLength = Math.max(0, nodePath.length - 1);
  
  const handleStartAdventure = () => {
    startAdventure(MAZEID);
  };

  const handleResetPath = () => {
    resetPath();
  };

  const handleSubmitPath = async () => {
    const response = await getDSL();
    if (response) {
      toast.success("Path submitted.");
    } else {
      toast.error("Failed to submit path.");
    }
  };

  const handleShortestPath = async () => {
    try {
      const shortestPathRes = await getShortestPath(MAZEID);
      if (shortestPathRes) {
        toast.success("Shortest path loaded.");
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

  const getPreferredAnimationNodePath = () =>
    shortestPathNodePath.length > 1 ? shortestPathNodePath : nodePath;

  const handleShowAnimation = () => {
    const animationNodePath = getPreferredAnimationNodePath();

    if (!startAnimation(animationNodePath)) {
      toast.error("No path available to animate.");
      return;
    }

    toast("Path animation on-going.");
  };

  const handleOpenDev3DPreview = () => {
    if (!isDevMode) return;
    startPreviewAnimation(getPreferredAnimationNodePath());
  };

  const handleCloseAnimationView = () => {
    closeAnimationView();
  };

  const isPathSubmitted =
    Boolean(lastSubmittedKey) && pathKey === lastSubmittedKey;
  const hasShortestPathDisplayed = shortestPathNodePath.length > 1;
  const hasAnimatablePath =
    nodePath.length > 1 || shortestPathNodePath.length > 1;
  const canShowAnimationButton = isPathSubmitted && hasAnimatablePath;
  const isPreviewView = isDevMode && animationState.status === "preview";
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
    <div className="min-h-screen p-6 flex flex-col items-center justify-start md:justify-center">
      <Toaster />
      <div className="w-full max-w-[520px] space-y-4">
        {isAnimationView ? (
          <AnimationView
            sceneData={viewSceneData}
            progress={viewProgress}
            total={viewTotal}
            label={isDevMode && isPreviewView ? "3D maze preview (dev only)" : undefined}
            showPlaybackCamera={!isPreviewView}
            onClose={isPreviewView ? handleCloseAnimationView : undefined}
          />
        ) : (
          <>
            {error && <div className="text-red-600">{error}</div>}
            {submitError && <div className="text-red-600">{submitError}</div>}
            <DslStrip dsl={dsl} />
            {maze && (
              <PathInfo
                userPathLength={userPathLength}
                shortestPathLength={shortestPath?.length}
              />
            )}
            {maze && (
              <MazePanel
                maze={maze}
                onNodeClick={selectNode}
                onUndo={handleUndoNodeSelection}
                onShowAnimation={handleShowAnimation}
                onOpen3DPreview={handleOpenDev3DPreview}
                isPathSubmitted={isPathSubmitted}
                canShowAnimationButton={canShowAnimationButton}
                nodePath={nodePath}
                secondaryHighlightedNodePath={shortestPathNodePath}
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
                hasShortestPathDisplayed,
              }}
              actions={{
                onReset: handleResetPath,
                onSubmit: handleSubmitPath,
                onShortestPath: handleShortestPath,
              }}
            />
          </>
        )}
      </div>
    </div>
  );
}
