import { useMemo } from "react";
import type { AnimationSceneData } from "@/lib/animation";
import { Canvas } from "@react-three/fiber";
import { Line, OrbitControls } from "@react-three/drei";
import * as THREE from "three";
import { AnimationCameraRig } from "./AnimationCameraRig";
import { FlickerTorch } from "./scene/FlickerTorch";
import { EmergingSun } from "./scene/EmergingSun";
import { JourneyLighting } from "./scene/JourneyLighting";
import { StormAtmosphere } from "./scene/StormAtmosphere";
import { FlowerFountain } from "./scene/FlowerFountain";
import { AnimationHud } from "./controll/AnimationHud";

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
  const floorInset = 0.16;
  const torchPositions = useMemo<[number, number, number][]>(
    () => [
      [-sceneData.floorSize[0] * 0.32, 1.35, -sceneData.floorSize[1] * 0.3],
      [sceneData.floorSize[0] * 0.32, 1.35, sceneData.floorSize[1] * 0.3],
    ],
    [sceneData.floorSize],
  );
  const wallPalette = ["#766851", "#877560", "#695c49", "#8f7e66"] as const;
  const viewLabel = label ?? `Playing animation (${progress}/${total})`;

  return (
    <div className="relative h-[100dvh] w-full overflow-hidden bg-[#161a22]">
      <Canvas
        className="h-full w-full"
        shadows
        dpr={[1, 1.8]}
        camera={{
          fov: 65,
          near: 0.01,
          far: 500,
          position: [0, previewDistance, previewDistance],
        }}
        onCreated={({ gl }) => {
          gl.shadowMap.enabled = true;
          gl.shadowMap.type = THREE.PCFSoftShadowMap;
          gl.toneMapping = THREE.ACESFilmicToneMapping;
          gl.toneMappingExposure = 1.14;
        }}
      >
        <color attach="background" args={["#161a22"]} />
        <fog
          attach="fog"
          args={["#1b2029", maxFloorDimension * 1.9, maxFloorDimension * 6]}
        />
        <ambientLight intensity={0.48} color="#a08969" />
        <hemisphereLight
          args={["#aab7cf", "#2c2219", 0.72]}
        />
        <directionalLight
          position={[maxFloorDimension * 0.48, maxFloorDimension * 1.25, maxFloorDimension * 0.36]}
          intensity={1.35}
          color="#d8e2f4"
          castShadow
          shadow-mapSize-width={2048}
          shadow-mapSize-height={2048}
          shadow-camera-near={1}
          shadow-camera-far={maxFloorDimension * 5}
          shadow-camera-left={-maxFloorDimension}
          shadow-camera-right={maxFloorDimension}
          shadow-camera-top={maxFloorDimension}
          shadow-camera-bottom={-maxFloorDimension}
          shadow-bias={-0.00035}
        />
        <directionalLight
          position={[-maxFloorDimension * 0.32, maxFloorDimension * 0.9, -maxFloorDimension * 0.5]}
          intensity={0.6}
          color="#f2d2a7"
        />
        <pointLight
          position={[0, 1.8, 0]}
          intensity={0.45}
          distance={maxFloorDimension * 2.8}
          decay={2}
          color="#d8dce8"
        />
        <JourneyLighting
          progress={progress}
          total={total}
          maxFloorDimension={maxFloorDimension}
        />
        <EmergingSun
          progress={progress}
          total={total}
          maxFloorDimension={maxFloorDimension}
          endPoint={sceneData.endPoint}
        />
        <StormAtmosphere
          maxFloorDimension={maxFloorDimension}
          progress={progress}
          total={total}
        />

        <FlickerTorch position={torchPositions[0]} phase={0} />
        <FlickerTorch position={torchPositions[1]} phase={1.2} />

        <mesh position={[0, -0.42, 0]} receiveShadow>
          <boxGeometry
            args={[sceneData.floorSize[0] + 4, 0.8, sceneData.floorSize[1] + 4]}
          />
          <meshStandardMaterial color="#201d26" roughness={1} metalness={0.03} />
        </mesh>

        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.06, 0]} receiveShadow>
          <planeGeometry args={sceneData.floorSize} />
          <meshStandardMaterial
            color="#4a3d2d"
            roughness={0.9}
            metalness={0.08}
          />
        </mesh>

        <mesh
          rotation={[-Math.PI / 2, 0, 0]}
          position={[0, -0.057, 0]}
        >
          <ringGeometry
            args={[maxFloorDimension * 0.12, maxFloorDimension * 0.49, 64]}
          />
          <meshBasicMaterial
            color="#b48d52"
            opacity={0.13}
            transparent
            side={THREE.DoubleSide}
          />
        </mesh>

        {sceneData.wallSegments.map((wall, index) => (
          <mesh
            key={`wall-${index}-${wall.position[0]}-${wall.position[2]}-${wall.rotationY}`}
            position={wall.position}
            rotation={[0, wall.rotationY, 0]}
            castShadow
            receiveShadow
          >
            <boxGeometry
              args={[
                Math.max(wall.size[0] - floorInset * 0.05, 0.08),
                wall.size[1],
                wall.size[2],
              ]}
            />
            <meshStandardMaterial
              color={wallPalette[index % wallPalette.length]}
              roughness={0.84}
              metalness={0.12}
            />
          </mesh>
        ))}

        {sceneData.visibleRouteLine.length >= 2 && (
          <Line
            points={sceneData.visibleRouteLine}
            color="#8f8574"
            lineWidth={1.1}
            transparent
            opacity={0.66}
          />
        )}

        {sceneData.startPoint && (
          <mesh position={sceneData.startPoint} castShadow>
            <octahedronGeometry args={[0.24, 0]} />
            <meshStandardMaterial
              color="#8bd3bf"
              emissive="#34d399"
              emissiveIntensity={0.45}
              roughness={0.35}
              metalness={0.2}
            />
          </mesh>
        )}

        {sceneData.endPoint && (
          <mesh position={sceneData.endPoint} castShadow>
            <octahedronGeometry args={[0.24, 0]} />
            <meshStandardMaterial
              color="#f97364"
              emissive="#fb923c"
              emissiveIntensity={0.5}
              roughness={0.32}
              metalness={0.2}
            />
          </mesh>
        )}

        {showPlaybackCamera && (
          <FlowerFountain
            origin={sceneData.endPoint}
            progress={progress}
            total={total}
          />
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
      <AnimationHud label={viewLabel} onClose={onClose} />
    </div>
  );
}
