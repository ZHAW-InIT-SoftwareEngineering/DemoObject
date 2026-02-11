import { useEffect } from "react";

type AnimationViewProps = {
  onComplete: () => void;
  durationMs?: number;
};

export function AnimationView({
  onComplete,
  durationMs = 2000,
}: AnimationViewProps) {
  useEffect(() => {
    const timer = window.setTimeout(() => {
      onComplete();
    }, durationMs);

    return () => window.clearTimeout(timer);
  }, [durationMs, onComplete]);

  return (
    <div className="w-full rounded border border-gray-200 bg-white p-6 text-center">
      <p className="text-sm text-gray-700">Playing animation...</p>
    </div>
  );
}
