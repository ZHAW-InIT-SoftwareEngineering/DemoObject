import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import {
  advanceThunderStormState,
  createGroundFogLayerConfigs,
  createStormCloudConfigs,
  createThunderStormState,
  getGroundFogLayerState,
  getStormCloudPosition,
  getStormCloudTargetProgressRatio,
  getStormCloudVisualState,
  getThunderLightIntensity,
  getThunderLightPosition,
  smoothStormCloudProgress,
} from "@/lib/animation/sceneDynamics";

type StormAtmosphereProps = {
  maxFloorDimension: number;
  progress: number;
  total: number;
};

type GroundFogLayerProps = {
  maxFloorDimension: number;
};

type StormCloudLayerProps = {
  maxFloorDimension: number;
  progress: number;
  total: number;
};

type ThunderLightProps = {
  maxFloorDimension: number;
};

export function StormAtmosphere({
  maxFloorDimension,
  progress,
  total,
}: StormAtmosphereProps) {
  return (
    <>
      <ThunderLight maxFloorDimension={maxFloorDimension} />
      <StormCloudLayer
        maxFloorDimension={maxFloorDimension}
        progress={progress}
        total={total}
      />
      <GroundFogLayer maxFloorDimension={maxFloorDimension} />
    </>
  );
}

function GroundFogLayer({ maxFloorDimension }: GroundFogLayerProps) {
  const fogLayerRefs = useRef<Array<THREE.Mesh | null>>([]);
  const layers = useMemo(
    () => createGroundFogLayerConfigs(maxFloorDimension),
    [maxFloorDimension],
  );

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();

    layers.forEach((layer, index) => {
      const mesh = fogLayerRefs.current[index];
      if (!mesh) return;
      const layerState = getGroundFogLayerState(layer, t);

      mesh.rotation.z = layerState.rotationZ;
      mesh.position.y = layerState.y;
      const material = mesh.material as THREE.MeshBasicMaterial;
      material.opacity = layerState.opacity;
    });
  });

  return (
    <>
      {layers.map((layer, index) => (
        <mesh
          key={`ground-fog-${index}`}
          ref={(node) => {
            fogLayerRefs.current[index] = node;
          }}
          rotation={[-Math.PI / 2, 0, 0]}
          position={[0, layer.y, 0]}
          renderOrder={1}
        >
          <circleGeometry args={[layer.radius, 64]} />
          <meshBasicMaterial
            color="#cdd5e6"
            transparent
            opacity={layer.baseOpacity}
            depthWrite={false}
            side={THREE.DoubleSide}
          />
        </mesh>
      ))}
    </>
  );
}

function StormCloudLayer({
  maxFloorDimension,
  progress,
  total,
}: StormCloudLayerProps) {
  const cloudRefs = useRef<Array<THREE.Group | null>>([]);
  const smoothedProgressRef = useRef(0);
  const cloudDarkColorRef = useRef(new THREE.Color("#303744"));
  const cloudLightColorRef = useRef(new THREE.Color("#c0ccd9"));
  const cloudConfigs = useMemo(
    () => createStormCloudConfigs(maxFloorDimension),
    [maxFloorDimension],
  );

  useFrame(({ clock }, delta) => {
    const targetProgressRatio = getStormCloudTargetProgressRatio(progress, total);
    smoothedProgressRef.current = smoothStormCloudProgress(
      smoothedProgressRef.current,
      targetProgressRatio,
      delta,
    );
    const progressRatio = smoothedProgressRef.current;
    const t = clock.getElapsedTime();
    cloudConfigs.forEach((cloud, index) => {
      const group = cloudRefs.current[index];
      if (!group) return;
      const cloudPosition = getStormCloudPosition(cloud, t, progressRatio);
      const cloudVisualState = getStormCloudVisualState(cloud, progressRatio);
      group.position.set(cloudPosition.x, cloudPosition.y, cloudPosition.z);

      for (const child of group.children) {
        if (!(child instanceof THREE.Mesh)) continue;
        if (!(child.material instanceof THREE.MeshStandardMaterial)) continue;

        const material = child.material;
        if (material.userData.baseOpacity === undefined) {
          material.userData.baseOpacity = material.opacity;
        }
        material.color.lerpColors(
          cloudDarkColorRef.current,
          cloudLightColorRef.current,
          cloudVisualState.brightenRatio,
        );
        material.opacity = material.userData.baseOpacity * cloudVisualState.alpha;
      }
    });
  });

  return (
    <group>
      {cloudConfigs.map((cloud, index) => (
        <group
          key={`storm-cloud-${index}`}
          ref={(node) => {
            cloudRefs.current[index] = node;
          }}
          position={[cloud.x, cloud.y, cloud.z]}
          scale={[cloud.scale, cloud.scale * 0.82, cloud.scale * 0.98]}
        >
          <mesh>
            <sphereGeometry args={[1.28, 18, 18]} />
            <meshStandardMaterial
              color="#303744"
              roughness={0.95}
              metalness={0.05}
              transparent
              opacity={0.72}
            />
          </mesh>
          <mesh position={[-0.95, -0.08, 0.24]} scale={[0.92, 0.8, 0.9]}>
            <sphereGeometry args={[1.08, 16, 16]} />
            <meshStandardMaterial
              color="#2a323f"
              roughness={0.95}
              metalness={0.03}
              transparent
              opacity={0.68}
            />
          </mesh>
          <mesh position={[1.05, -0.06, -0.28]} scale={[0.98, 0.78, 0.92]}>
            <sphereGeometry args={[1.02, 16, 16]} />
            <meshStandardMaterial
              color="#353d4a"
              roughness={0.95}
              metalness={0.03}
              transparent
              opacity={0.7}
            />
          </mesh>
          <mesh position={[0.2, -0.22, 0.75]} scale={[0.7, 0.58, 0.66]}>
            <sphereGeometry args={[0.92, 14, 14]} />
            <meshStandardMaterial
              color="#272f3d"
              roughness={0.96}
              metalness={0.03}
              transparent
              opacity={0.66}
            />
          </mesh>
        </group>
      ))}
    </group>
  );
}

function ThunderLight({ maxFloorDimension }: ThunderLightProps) {
  const lightRef = useRef<THREE.PointLight>(null);
  const stormStateRef = useRef(createThunderStormState());

  useFrame(({ clock }, delta) => {
    const t = clock.getElapsedTime();
    stormStateRef.current = advanceThunderStormState(stormStateRef.current, t);

    const light = lightRef.current;
    if (!light) return;

    const position = getThunderLightPosition(t, maxFloorDimension);
    light.position.x = position.x;
    light.position.z = position.z;
    light.intensity = getThunderLightIntensity(
      t,
      light.intensity,
      delta,
      stormStateRef.current,
    );
  });

  return (
    <pointLight
      ref={lightRef}
      color="#c8d8ff"
      intensity={0}
      distance={maxFloorDimension * 3.6}
      decay={1.5}
      position={[0, maxFloorDimension * 0.36, 0]}
    />
  );
}
