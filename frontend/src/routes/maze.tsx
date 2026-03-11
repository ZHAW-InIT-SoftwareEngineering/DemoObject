import { useEffect } from "react";
import { Outlet, createFileRoute, useNavigate } from "@tanstack/react-router";
import { StartLoadingScreen } from "@/components/app/StartLoadingScreen";
import { useDemoFlow } from "@/components/app/DemoFlowProvider";

export const Route = createFileRoute("/maze")({
  component: MazeLayout,
});

function MazeLayout() {
  const navigate = useNavigate();
  const { hasActiveSession, loading } = useDemoFlow();

  useEffect(() => {
    if (loading || hasActiveSession) return;
    void navigate({ to: "/", replace: true });
  }, [hasActiveSession, loading, navigate]);

  if (!hasActiveSession) {
    return loading ? <StartLoadingScreen /> : null;
  }

  return <Outlet />;
}
