import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import type { Vec3 } from "@/lib/animation";
import {
  createFlowerPetalConfigs,
  FLOWER_FOUNTAIN_VISIBILITY_EPSILON,
  FLOWER_PETAL_COLORS,
  FLOWER_PETAL_COUNT,
  getFlowerFountainActivation,
  getFlowerFountainGlowIntensity,
  getFlowerFountainGlowPosition,
  getFlowerPetalFrameState,
} from "@/lib/animation/sceneDynamics";

type FlowerFountainProps = {
  origin: Vec3 | null;
  progress: number;
  total: number;
};

export function FlowerFountain({ origin, progress, total }: FlowerFountainProps) {
  const petalsRef = useRef<THREE.InstancedMesh>(null);
  const glowRef = useRef<THREE.PointLight>(null);
  const dummyRef = useRef(new THREE.Object3D());

  const petals = useMemo(() => createFlowerPetalConfigs(), []);
  const petalColors = useMemo(
    () =>
      petals.map(
        (petal) => new THREE.Color(FLOWER_PETAL_COLORS[petal.colorIndex]),
      ),
    [petals],
  );

  useFrame(({ clock }) => {
    const petalsMesh = petalsRef.current;
    if (!petalsMesh || !origin || total <= 0) return;

    const elapsedTime = clock.getElapsedTime();
    const activation = getFlowerFountainActivation(progress, total);
    petalsMesh.visible = activation > FLOWER_FOUNTAIN_VISIBILITY_EPSILON;

    if (glowRef.current) {
      const glowPosition = getFlowerFountainGlowPosition(origin);
      glowRef.current.position.set(...glowPosition);
      glowRef.current.intensity = getFlowerFountainGlowIntensity(
        activation,
        elapsedTime,
      );
    }

    if (activation <= FLOWER_FOUNTAIN_VISIBILITY_EPSILON) return;

    const dummy = dummyRef.current;

    for (let index = 0; index < petals.length; index++) {
      const petal = petals[index];
      const state = getFlowerPetalFrameState(
        petal,
        elapsedTime,
        activation,
        origin,
      );

      dummy.position.set(state.x, state.y, state.z);
      dummy.rotation.set(state.rotationX, state.rotationY, state.rotationZ);
      dummy.scale.setScalar(state.scale);
      dummy.updateMatrix();

      petalsMesh.setMatrixAt(index, dummy.matrix);
      petalsMesh.setColorAt(index, petalColors[index]);
    }

    petalsMesh.instanceMatrix.needsUpdate = true;
    if (petalsMesh.instanceColor) {
      petalsMesh.instanceColor.needsUpdate = true;
    }
  });

  if (!origin) return null;

  return (
    <>
      <instancedMesh
        ref={petalsRef}
        args={[undefined, undefined, FLOWER_PETAL_COUNT]}
        frustumCulled={false}
      >
        <coneGeometry args={[0.055, 0.18, 6]} />
        <meshStandardMaterial
          color="#ffb3c6"
          roughness={0.42}
          metalness={0.06}
          emissive="#4a2a1a"
          emissiveIntensity={0.2}
        />
      </instancedMesh>
      <pointLight
        ref={glowRef}
        color="#ffd6ea"
        intensity={0}
        distance={6}
        decay={1.7}
      />
    </>
  );
}
