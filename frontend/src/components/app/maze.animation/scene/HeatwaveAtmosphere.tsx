import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import {
  createHeatShimmerBandConfigs,
  getHeatShimmerBandState,
  getHeatwaveTargetIntensity,
  smoothHeatwaveIntensity,
} from "@/lib/animation/sceneDynamics";

type HeatwaveAtmosphereProps = {
  maxFloorDimension: number;
  floorSize: [number, number];
  progress: number;
  total: number;
};

type HeatShimmerLayerProps = {
  maxFloorDimension: number;
  progress: number;
  total: number;
};

type UrbanHeatPerimeterProps = {
  floorSize: [number, number];
  maxFloorDimension: number;
};

type BuildingConfig = {
  position: [number, number, number];
  size: [number, number, number];
  color: string;
  accent: string;
};

function createUrbanBuildingConfigs(
  floorSize: [number, number],
  maxFloorDimension: number,
): BuildingConfig[] {
  const [floorWidth, floorDepth] = floorSize;
  const colors = ["#6b655b", "#81766b", "#5f6f6c", "#94816b", "#6f6a73"] as const;
  const accents = ["#d8c3a1", "#b8d3c7", "#f4c27e", "#d6d4c7", "#a9c7d6"] as const;
  const sideCount = Math.max(5, Math.round(maxFloorDimension / 2.7));
  const configs: BuildingConfig[] = [];

  for (let index = 0; index < sideCount; index++) {
    const ratio = sideCount === 1 ? 0.5 : index / (sideCount - 1);
    const x = (ratio - 0.5) * (floorWidth + 2.4);
    const width = 0.9 + ((index * 0.37) % 1) * 1.3;
    const depth = 1.05 + ((index * 0.23) % 1) * 0.7;
    const height = 1.45 + ((index * 0.29) % 1) * 2.1;
    const zOffset = floorDepth / 2 + 2.2 + ((index * 0.17) % 1) * 1.2;

    configs.push({
      position: [x, height / 2 - 0.06, zOffset],
      size: [width, height, depth],
      color: colors[index % colors.length],
      accent: accents[index % accents.length],
    });
    configs.push({
      position: [-x, height / 2 - 0.06, -zOffset],
      size: [width * 0.92, height * 0.86, depth * 1.08],
      color: colors[(index + 2) % colors.length],
      accent: accents[(index + 3) % accents.length],
    });
  }

  const crossCount = Math.max(4, Math.round(maxFloorDimension / 3.4));
  for (let index = 0; index < crossCount; index++) {
    const ratio = crossCount === 1 ? 0.5 : index / (crossCount - 1);
    const z = (ratio - 0.5) * (floorDepth + 1.8);
    const width = 1 + ((index * 0.41) % 1) * 0.9;
    const depth = 0.95 + ((index * 0.31) % 1) * 1.1;
    const height = 1.2 + ((index * 0.47) % 1) * 1.9;
    const xOffset = floorWidth / 2 + 2.3 + ((index * 0.21) % 1) * 1.15;

    configs.push({
      position: [xOffset, height / 2 - 0.06, z],
      size: [width, height, depth],
      color: colors[(index + 1) % colors.length],
      accent: accents[(index + 2) % accents.length],
    });
    configs.push({
      position: [-xOffset, height / 2 - 0.06, -z],
      size: [width * 1.08, height * 0.92, depth],
      color: colors[(index + 4) % colors.length],
      accent: accents[(index + 1) % accents.length],
    });
  }

  return configs;
}

export function HeatwaveAtmosphere({
  maxFloorDimension,
  floorSize,
  progress,
  total,
}: HeatwaveAtmosphereProps) {
  return (
    <>
      <HeatShimmerLayer
        maxFloorDimension={maxFloorDimension}
        progress={progress}
        total={total}
      />
      <UrbanHeatPerimeter
        floorSize={floorSize}
        maxFloorDimension={maxFloorDimension}
      />
    </>
  );
}

function HeatShimmerLayer({
  maxFloorDimension,
  progress,
  total,
}: HeatShimmerLayerProps) {
  const bandRefs = useRef<Array<THREE.Mesh | null>>([]);
  const intensityRef = useRef(0.55);
  const bands = useMemo(
    () => createHeatShimmerBandConfigs(maxFloorDimension),
    [maxFloorDimension],
  );

  useFrame(({ clock }, delta) => {
    intensityRef.current = smoothHeatwaveIntensity(
      intensityRef.current,
      getHeatwaveTargetIntensity(progress, total),
      delta,
    );

    const elapsedTime = clock.getElapsedTime();
    bands.forEach((band, index) => {
      const mesh = bandRefs.current[index];
      if (!mesh) return;

      const bandState = getHeatShimmerBandState(
        band,
        elapsedTime,
        intensityRef.current,
      );
      mesh.position.set(bandState.x, bandState.y, bandState.z);
      mesh.rotation.set(0, bandState.rotationY, 0);
      mesh.scale.y = bandState.scaleY;

      if (mesh.material instanceof THREE.MeshBasicMaterial) {
        mesh.material.opacity = bandState.opacity;
      }
    });
  });

  return (
    <group>
      {bands.map((band, index) => (
        <mesh
          key={`heat-shimmer-${index}`}
          ref={(node) => {
            bandRefs.current[index] = node;
          }}
          position={[band.x, 0.42, band.z]}
          rotation={[0, band.rotationY, 0]}
          renderOrder={2}
        >
          <planeGeometry args={[band.width, band.height, 1, 3]} />
          <meshBasicMaterial
            color="#fff0bc"
            transparent
            opacity={band.baseOpacity}
            depthWrite={false}
            side={THREE.DoubleSide}
            blending={THREE.AdditiveBlending}
          />
        </mesh>
      ))}
    </group>
  );
}

function UrbanHeatPerimeter({
  floorSize,
  maxFloorDimension,
}: UrbanHeatPerimeterProps) {
  const buildings = useMemo(
    () => createUrbanBuildingConfigs(floorSize, maxFloorDimension),
    [floorSize, maxFloorDimension],
  );

  return (
    <group>
      {buildings.map((building, index) => (
        <group
          key={`urban-building-${index}`}
          position={building.position}
        >
          <mesh castShadow receiveShadow>
            <boxGeometry args={building.size} />
            <meshStandardMaterial
              color={building.color}
              roughness={0.88}
              metalness={0.03}
            />
          </mesh>
          <mesh
            position={[
              0,
              building.size[1] * 0.12,
              building.size[2] / 2 + 0.011,
            ]}
          >
            <boxGeometry
              args={[
                building.size[0] * 0.64,
                Math.min(building.size[1] * 0.45, 1.1),
                0.024,
              ]}
            />
            <meshStandardMaterial
              color={building.accent}
              emissive={building.accent}
              emissiveIntensity={0.05}
              roughness={0.7}
              metalness={0.02}
            />
          </mesh>
        </group>
      ))}
    </group>
  );
}
