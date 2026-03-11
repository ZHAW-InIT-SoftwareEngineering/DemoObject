import { useEffect } from "react";
import { useNavigate } from "@tanstack/react-router";
import { StartLoadingScreen } from "@/components/app/StartLoadingScreen";
import { StartScreen } from "@/components/app/StartScreen";
import { useDemoSession } from "@/hooks";

export function HomePage() {
  const navigate = useNavigate();
  const {
    error,
    hasActiveSession,
    loading,
    startAdventure,
  } = useDemoSession();

  useEffect(() => {
    if (!hasActiveSession) return;
    void navigate({ to: "/maze", replace: true });
  }, [hasActiveSession, navigate]);

  if (loading && !hasActiveSession) {
    return <StartLoadingScreen />;
  }

  if (hasActiveSession) {
    return null;
  }

  return (
    <div className="min-h-screen p-6 flex flex-col items-center justify-center">
      <div className="w-full max-w-[520px] space-y-4">
        {error && <div className="text-red-600">{error}</div>}
        <StartScreen loading={loading} onStart={() => void startAdventure()} />
      </div>
    </div>
  );
}
