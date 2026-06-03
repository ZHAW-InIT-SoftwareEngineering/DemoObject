import { getHeatGlareOpacity, getProgressRatio } from "@/lib/animation/sceneDynamics";

type HeatUrgencyOverlayProps = {
  progress: number;
  total: number;
};

const DRIPS = [
  { left: "13%", width: 14, height: 58, delay: 0.1 },
  { left: "28%", width: 9, height: 36, delay: 0.35 },
  { left: "62%", width: 12, height: 50, delay: 0.2 },
  { left: "79%", width: 16, height: 68, delay: 0.48 },
] as const;

export function HeatUrgencyOverlay({
  progress,
  total,
}: HeatUrgencyOverlayProps) {
  const progressRatio = getProgressRatio(progress, total);
  const glareOpacity = getHeatGlareOpacity(progress, total);
  const dripOpacity = 0.1 + progressRatio * 0.22;

  return (
    <div className="pointer-events-none absolute inset-0 z-[5] overflow-hidden">
      <div
        className="absolute inset-0"
        style={{
          background: `radial-gradient(circle at 72% ${34 - progressRatio * 12}%, rgba(255, 221, 132, ${glareOpacity}), transparent 36%), linear-gradient(90deg, rgba(255, 142, 76, ${0.08 + progressRatio * 0.08}), transparent 18%, transparent 82%, rgba(255, 184, 94, ${0.12 + progressRatio * 0.1}))`,
          mixBlendMode: "screen",
        }}
      />
      <div
        className="absolute inset-x-0 top-0 h-28"
        style={{
          background:
            "linear-gradient(180deg, rgba(255, 214, 142, 0.3), rgba(255, 214, 142, 0))",
          opacity: 0.22 + progressRatio * 0.2,
        }}
      />
      {DRIPS.map((drip, index) => (
        <div
          key={`heat-drip-${index}`}
          className="absolute top-0 rounded-b-full"
          style={{
            left: drip.left,
            width: drip.width,
            height: drip.height * (0.55 + progressRatio * 0.7),
            opacity: dripOpacity,
            transform: `translateY(${progressRatio * 12 + drip.delay * 8}px)`,
            background:
              "linear-gradient(180deg, rgba(255, 236, 185, 0.72), rgba(255, 166, 98, 0.18))",
            filter: "blur(1px)",
          }}
        />
      ))}
    </div>
  );
}
