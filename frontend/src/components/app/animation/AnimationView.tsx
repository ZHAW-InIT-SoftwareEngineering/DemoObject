import { Button, Card, CardContent } from "@/components/ui";
import type { AnimationSceneData } from "@/lib/animation";
import { Canvas } from "@react-three/fiber";
import { Line, OrbitControls } from "@react-three/drei";
import { AnimationCameraRig } from "./AnimationCameraRig";

type AnimationViewProps = {
  sceneData: AnimationSceneData;
  progress: number;
  total: number;
  label?: string;
  showPlaybackCamera?: boolean;
  onClose?: () => void;
};

export function AnimationView({
  sceneData,
  progress,
  total,
  label,
  showPlaybackCamera = true,
  onClose,
}: AnimationViewProps) {
  const maxFloorDimension = Math.max(sceneData.floorSize[0], sceneData.floorSize[1]);
  const previewDistance = Math.max(maxFloorDimension * 0.9, 10);
  const minPreviewDistance = Math.max(maxFloorDimension * 0.25, 3);

  return (
    <Card className="py-4">
      <CardContent className="px-4 space-y-3">
        <div className="flex items-center justify-between gap-3 text-sm text-gray-700">
          <div>{label ?? `Playing animation (${progress}/${total})`}</div>
          {onClose && (
            <Button type="button" variant="outline" onClick={onClose}>
              Back
            </Button>
          )}
        </div>
        <div className="w-full aspect-square overflow-hidden rounded border bg-slate-100">
          <Canvas
            camera={{
              fov: 65,
              near: 0.01,
              far: 500,
              position: [0, previewDistance, previewDistance],
            }}
          >
            <color attach="background" args={["#f8fafc"]} />
            <ambientLight intensity={0.9} />
            <directionalLight position={[8, 18, 8]} intensity={1.25} />

            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.04, 0]}>
              <planeGeometry args={sceneData.floorSize} />
              <meshStandardMaterial color="#e2e8f0" />
            </mesh>

            {sceneData.wallSegments.map((wall, index) => (
              <mesh
                key={`wall-${index}-${wall.position[0]}-${wall.position[2]}-${wall.rotationY}`}
                position={wall.position}
                rotation={[0, wall.rotationY, 0]}
              >
                <boxGeometry args={wall.size} />
                <meshStandardMaterial color="#64748b" />
              </mesh>
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

            {showPlaybackCamera && (
              <AnimationCameraRig
                pathPoints={sceneData.routeLine}
                progress={progress}
                total={total}
              />
            )}

            {!showPlaybackCamera && (
              <OrbitControls
                makeDefault
                enableDamping
                dampingFactor={0.08}
                target={[0, 0.35, 0]}
                minDistance={minPreviewDistance}
                maxDistance={maxFloorDimension * 3}
                maxPolarAngle={Math.PI / 2.02}
              />
            )}
          </Canvas>
        </div>
      </CardContent>
    </Card>
  );
}
