import { useEffect } from "react";
import { Outlet, createFileRoute, useNavigate } from "@tanstack/react-router";
import { StartLoadingScreen } from "@/components/app/index/StartLoadingScreen";
import { TheoryChatWidget } from "@/components/app/theory/TheoryChatWidget";
import { useDemoSession } from "@/hooks";

export const Route = createFileRoute("/theory")({
  component: TheoryLayout,
});

function TheoryLayout() {
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
    <>
      <Outlet />
      <TheoryChatWidget />
    </>
  );
}
