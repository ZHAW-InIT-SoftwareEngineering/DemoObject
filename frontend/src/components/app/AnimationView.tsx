import { useMemo } from "react";
import type { MazesMazeIdGet200Response } from "@/api";
import { Card, CardContent } from "@/components/ui";
import { useEdgePlayback } from "@/hooks/useEdgePlayback";
import { buildAnimationSceneData } from "@/lib/animation";
import { Canvas } from "@react-three/fiber";
import { Line } from "@react-three/drei";
import { AnimationCameraRig } from "./AnimationCameraRig";

type AnimationViewProps = {
  maze: MazesMazeIdGet200Response | null;
  edgeKeys: string[];
  onComplete: () => void;
  stepMs?: number;
  settleMs?: number;
};

export function AnimationView({
  maze,
  edgeKeys,
  onComplete,
  stepMs = 220,
  settleMs = 450,
}: AnimationViewProps) {
  const { progress, total } = useEdgePlayback({
    edgeKeys,
    onComplete,
    stepMs,
    settleMs,
  });

  const sceneData = useMemo(
    () => buildAnimationSceneData(maze, edgeKeys, progress),
    [maze, edgeKeys, progress],
  );
  if (!maze) return null;

  return (
    <Card className="py-4">
      <CardContent className="px-4 space-y-3">
        <div className="text-sm text-gray-700">
          Playing animation ({progress}/{total})
        </div>
        <div className="w-full aspect-square overflow-hidden rounded border bg-slate-100">
          <Canvas camera={{ fov: 75, near: 0.01, far: 500 }}>
            <color attach="background" args={["#f8fafc"]} />
            <ambientLight intensity={0.9} />
            <directionalLight position={[8, 18, 8]} intensity={1.25} />

            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.04, 0]}>
              <planeGeometry args={sceneData.floorSize} />
              <meshStandardMaterial color="#e2e8f0" />
            </mesh>

            {sceneData.mazeEdgeLines.map((line, index) => (
              <Line
                key={`maze-${index}-${line[0][0]}-${line[0][2]}-${line[1][0]}-${line[1][2]}`}
                points={line}
                color="#cbd5e1"
                lineWidth={1}
              />
            ))}

            {sceneData.routeLine.length >= 2 && (
              <Line points={sceneData.routeLine} color="#94a3b8" lineWidth={1} />
            )}

            {sceneData.visibleRouteLine.length >= 2 && (
              <Line
                points={sceneData.visibleRouteLine}
                color="#16a34a"
                lineWidth={2}
              />
            )}

            {sceneData.startPoint && (
              <mesh position={sceneData.startPoint}>
                <sphereGeometry args={[0.22, 20, 20]} />
                <meshStandardMaterial color="#16a34a" />
              </mesh>
            )}

            {sceneData.endPoint && (
              <mesh position={sceneData.endPoint}>
                <sphereGeometry args={[0.22, 20, 20]} />
                <meshStandardMaterial color="#dc2626" />
              </mesh>
            )}

            <AnimationCameraRig
              pathPoints={sceneData.routeLine}
              progress={progress}
              total={total}
            />
          </Canvas>
        </div>
      </CardContent>
    </Card>
  );
}
