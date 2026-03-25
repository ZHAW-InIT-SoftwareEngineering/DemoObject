import { useEffect } from "react";
import { Outlet, createFileRoute, useNavigate } from "@tanstack/react-router";
import { MazeFlowProvider } from "@/components/app/MazeFlowProvider";
import { StartLoadingScreen } from "@/components/app/index/StartLoadingScreen";
import { useDemoSession } from "@/hooks";

export const Route = createFileRoute("/maze")({
  component: MazeLayout,
});

function MazeLayout() {
  const navigate = useNavigate();
  const { hasActiveSession, loading } = useDemoSession();

  useEffect(() => {
    if (loading || hasActiveSession) return;
    void navigate({ to: "/", replace: true });
  }, [hasActiveSession, loading, navigate]);

  if (!hasActiveSession) {
    return loading ? <StartLoadingScreen /> : null;
  }

  return (
    <MazeFlowProvider>
      <Outlet />
    </MazeFlowProvider>
  );
}
