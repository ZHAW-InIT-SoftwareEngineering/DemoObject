import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import type { Vec3 } from "@/lib/animation";
import {
  getEmergingSunPlacement,
  getEmergingSunTargetStrength,
  getEmergingSunVisualState,
  smoothEmergingSunStrength,
} from "@/lib/animation/sceneDynamics";

type EmergingSunProps = {
  progress: number;
  total: number;
  maxFloorDimension: number;
  endPoint: Vec3 | null;
};

export function EmergingSun({
  progress,
  total,
  maxFloorDimension,
  endPoint,
}: EmergingSunProps) {
  const sunGroupRef = useRef<THREE.Group>(null);
  const coreMaterialRef = useRef<THREE.MeshStandardMaterial>(null);
  const haloMaterialRef = useRef<THREE.MeshBasicMaterial>(null);
  const sunKeyLightRef = useRef<THREE.DirectionalLight>(null);
  const sunGlowLightRef = useRef<THREE.PointLight>(null);
  const smoothedEmergenceRef = useRef(0);

  useFrame((_, delta) => {
    const targetStrength = getEmergingSunTargetStrength(progress, total);
    smoothedEmergenceRef.current = smoothEmergingSunStrength(
      smoothedEmergenceRef.current,
      targetStrength,
      delta,
    );

    const sunStrength = smoothedEmergenceRef.current;
    const placement = getEmergingSunPlacement(
      maxFloorDimension,
      endPoint,
      sunStrength,
    );
    const visuals = getEmergingSunVisualState(sunStrength);

    if (sunGroupRef.current) {
      sunGroupRef.current.position.set(...placement.position);
      sunGroupRef.current.scale.setScalar(placement.scale);
    }

    if (coreMaterialRef.current) {
      coreMaterialRef.current.opacity = visuals.coreOpacity;
      coreMaterialRef.current.emissiveIntensity = visuals.coreEmissiveIntensity;
    }

    if (haloMaterialRef.current) {
      haloMaterialRef.current.opacity = visuals.haloOpacity;
    }

    if (sunKeyLightRef.current) {
      sunKeyLightRef.current.intensity = visuals.keyLightIntensity;
    }

    if (sunGlowLightRef.current) {
      sunGlowLightRef.current.intensity = visuals.glowLightIntensity;
    }
  });

  return (
    <group
      ref={sunGroupRef}
      position={[maxFloorDimension * 0.92, maxFloorDimension * 0.28, -maxFloorDimension * 0.92]}
    >
      <mesh>
        <sphereGeometry args={[1.25, 28, 28]} />
        <meshStandardMaterial
          ref={coreMaterialRef}
          color="#ffd88e"
          emissive="#ffc06d"
          emissiveIntensity={0.3}
          roughness={0.28}
          metalness={0.05}
          transparent
          opacity={0}
        />
      </mesh>

      <mesh>
        <sphereGeometry args={[2.85, 32, 32]} />
        <meshBasicMaterial
          ref={haloMaterialRef}
          color="#ffe9bc"
          transparent
          opacity={0}
          depthWrite={false}
        />
      </mesh>

      <directionalLight
        ref={sunKeyLightRef}
        position={[-1.4, -0.75, 0.35]}
        intensity={0}
        color="#ffd89a"
      />
      <pointLight
        ref={sunGlowLightRef}
        position={[0, 0, 0]}
        intensity={0}
        distance={maxFloorDimension * 5}
        decay={2}
        color="#ffd59d"
      />
    </group>
  );
}
