import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { getFlickerTorchIntensity } from "@/lib/animation/sceneDynamics";

type FlickerTorchProps = {
  position: [number, number, number];
  phase: number;
};

export function FlickerTorch({ position, phase }: FlickerTorchProps) {
  const lightRef = useRef<THREE.PointLight>(null);

  useFrame(({ clock }) => {
    if (!lightRef.current) return;
    lightRef.current.intensity = getFlickerTorchIntensity(clock.getElapsedTime(), phase);
  });

  return (
    <pointLight
      ref={lightRef}
      position={position}
      color="#ffb968"
      distance={24}
      decay={2.2}
      castShadow
      shadow-mapSize-width={512}
      shadow-mapSize-height={512}
      shadow-bias={-0.002}
    />
  );
}
