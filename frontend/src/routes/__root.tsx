import { createRootRoute, Outlet } from "@tanstack/react-router";
import { DemoFlowProvider, useDemoFlow } from "@/components/app/DemoFlowProvider";
import { CelebrationOverlay } from "@/components/app/animation/CelebrationOverlay";
import { AnimationPathSelectionOverlay } from "@/components/app/animation/AnimationPathSelectionOverlay";
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools";
import { DemoSessionProvider } from "@/hooks";
import { Toaster } from "@/components/ui";

function RootLayout() {
  return (
    <DemoSessionProvider>
      <DemoFlowProvider>
        <RootShell />
      </DemoFlowProvider>
    </DemoSessionProvider>
  );
}

function RootShell() {
  const {
    animationPathSelectionOpen,
    animationState,
    canUseShortestPath,
    canUseUserPath,
    dismissCelebrationOverlay,
    selectAnimationPath,
    setAnimationPathSelectionOpen,
    shortestPath,
    showCelebrationOverlay,
    userPathLength,
  } = useDemoFlow();
  return (
    <>
      <Toaster />
      <CelebrationOverlay
        open={showCelebrationOverlay}
        onClose={dismissCelebrationOverlay}
      />
      <AnimationPathSelectionOverlay
        open={animationPathSelectionOpen}
        onOpenChange={setAnimationPathSelectionOpen}
        onSelectPath={selectAnimationPath}
        canUseUserPath={canUseUserPath}
        canUseShortestPath={canUseShortestPath}
        userPathLength={userPathLength}
        shortestPathLength={shortestPath?.length}
      />
      <Outlet />
      {import.meta.env.DEV ? <TanStackRouterDevtools /> : null}
    </>
  );
}

export const Route = createRootRoute({
  component: RootLayout,
});
