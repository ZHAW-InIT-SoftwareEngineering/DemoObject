import { useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import {
  getJourneyLightingState,
  getJourneyLightingTargetRatio,
  smoothJourneyLightingRatio,
} from "@/lib/animation/sceneDynamics";

type JourneyLightingProps = {
  progress: number;
  total: number;
  maxFloorDimension: number;
};

export function JourneyLighting({
  progress,
  total,
  maxFloorDimension,
}: JourneyLightingProps) {
  const { scene, gl } = useThree();
  const ambientLiftRef = useRef<THREE.AmbientLight>(null);
  const dawnKeyLightRef = useRef<THREE.DirectionalLight>(null);
  const rimLightRef = useRef<THREE.PointLight>(null);
  const smoothedRatioRef = useRef(0);

  const baseBgColorRef = useRef(new THREE.Color("#161a22"));
  const endBgColorRef = useRef(new THREE.Color("#637fa8"));
  const baseFogColorRef = useRef(new THREE.Color("#1b2029"));
  const endFogColorRef = useRef(new THREE.Color("#a9bfd4"));
  const mixedBgRef = useRef(new THREE.Color());
  const mixedFogRef = useRef(new THREE.Color());

  useFrame((_, delta) => {
    const targetRatio = getJourneyLightingTargetRatio(progress, total);
    smoothedRatioRef.current = smoothJourneyLightingRatio(
      smoothedRatioRef.current,
      targetRatio,
      delta,
    );

    const ratio = smoothedRatioRef.current;
    const lightingState = getJourneyLightingState(ratio, maxFloorDimension);

    if (ambientLiftRef.current) {
      ambientLiftRef.current.intensity = lightingState.ambientIntensity;
    }
    if (dawnKeyLightRef.current) {
      dawnKeyLightRef.current.intensity = lightingState.keyLightIntensity;
    }
    if (rimLightRef.current) {
      rimLightRef.current.intensity = lightingState.rimLightIntensity;
    }

    mixedBgRef.current
      .copy(baseBgColorRef.current)
      .lerp(endBgColorRef.current, ratio);
    const background = scene.background;
    if (background instanceof THREE.Color) {
      background.copy(mixedBgRef.current);
    }

    if (scene.fog instanceof THREE.Fog) {
      mixedFogRef.current
        .copy(baseFogColorRef.current)
        .lerp(endFogColorRef.current, ratio);
      scene.fog.color.copy(mixedFogRef.current);
      scene.fog.near = lightingState.fogNear;
      scene.fog.far = lightingState.fogFar;
    }

    gl.toneMappingExposure = lightingState.toneMappingExposure;
  });

  return (
    <>
      <ambientLight ref={ambientLiftRef} intensity={0.04} color="#d6dfed" />
      <directionalLight
        ref={dawnKeyLightRef}
        position={[maxFloorDimension * 0.9, maxFloorDimension * 1.25, -maxFloorDimension * 0.46]}
        intensity={0.25}
        color="#dbe9ff"
      />
      <pointLight
        ref={rimLightRef}
        position={[0, maxFloorDimension * 0.5, -maxFloorDimension * 0.34]}
        intensity={0.08}
        distance={maxFloorDimension * 3}
        decay={2}
        color="#c4dbff"
      />
    </>
  );
}
